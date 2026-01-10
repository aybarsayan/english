import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const TEACHER_USERNAME = "ogretmen";
const TEACHER_PASSWORD = "kariyer2024";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("teacher_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Kullanıcı adı veya şifre hatalı" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Giriş başarısız" }, { status: 500 });
  }
}
