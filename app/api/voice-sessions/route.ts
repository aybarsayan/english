import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Check teacher auth
    const cookieStore = await cookies();
    const teacherAuth = cookieStore.get("teacher_auth");

    if (teacherAuth?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const section = searchParams.get("section");

    if (!grade || !section) {
      return NextResponse.json(
        { error: "Grade and section required" },
        { status: 400 }
      );
    }

    // Get all sessions for this class
    const sessions = await prisma.voiceSession.findMany({
      where: {
        grade: parseInt(grade),
        section: section,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by normalized student name
    const studentMap = new Map<
      string,
      {
        studentName: string;
        firstName: string;
        lastName: string;
        totalDuration: number;
        sessionCount: number;
        sessions: {
          id: string;
          messages: { id: string; text: string; isUser: boolean }[];
          duration: number;
          createdAt: Date;
        }[];
      }
    >();

    for (const session of sessions) {
      const key = session.studentName;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          studentName: session.studentName,
          firstName: session.firstName,
          lastName: session.lastName,
          totalDuration: 0,
          sessionCount: 0,
          sessions: [],
        });
      }
      const student = studentMap.get(key)!;
      student.totalDuration += session.duration;
      student.sessionCount += 1;
      student.sessions.push({
        id: session.id,
        messages: session.messages,
        duration: session.duration,
        createdAt: session.createdAt,
      });
    }

    // Sort students by name (Turkish locale)
    const students = Array.from(studentMap.values()).sort((a, b) =>
      a.studentName.localeCompare(b.studentName, "tr")
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Voice sessions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
