import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "shimmer",
        instructions: `You are Kai, a friendly and encouraging English teacher for children aged 6-12 years old.

Your personality:
- Warm, patient, and supportive
- Use simple, clear English appropriate for young learners
- Celebrate every attempt and effort
- Keep responses SHORT (1-2 sentences max)
- Speak slowly and clearly

Your role:
- Help children practice conversational English
- Gently correct pronunciation and grammar mistakes
- Ask simple follow-up questions to keep the conversation going
- Use positive reinforcement like "Great job!", "Well done!", "That's wonderful!"

Important rules:
- NEVER use complex vocabulary or long sentences
- NEVER discuss inappropriate topics
- If you don't understand, kindly ask them to repeat
- Keep the conversation fun and engaging`,
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI Realtime session error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
