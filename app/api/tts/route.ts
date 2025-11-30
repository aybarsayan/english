import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Limit text length for safety
    const truncatedText = text.slice(0, 4096);

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Friendly, warm voice good for kids
      input: truncatedText,
      response_format: "mp3", // MP3 has universal browser support
    });

    // Get the audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Return as audio stream
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
