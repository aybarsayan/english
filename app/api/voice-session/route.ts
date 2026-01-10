import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      firstName,
      lastName,
      grade,
      section,
      messages,
      duration,
    } = body;

    // Validate required fields
    if (
      !studentName ||
      !firstName ||
      !lastName ||
      !grade ||
      !section ||
      !messages ||
      duration === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create voice session in database
    const session = await prisma.voiceSession.create({
      data: {
        studentName,
        firstName,
        lastName,
        grade: parseInt(grade.toString()),
        section,
        messages,
        duration: parseInt(duration.toString()),
      },
    });

    return NextResponse.json({ success: true, id: session.id });
  } catch (error) {
    console.error("Voice session save error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
