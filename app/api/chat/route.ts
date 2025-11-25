import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await getChatCompletion(SYSTEM_PROMPT, history, message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Oops! Something went wrong. Please try again! 🔄" },
      { status: 500 }
    );
  }
}
