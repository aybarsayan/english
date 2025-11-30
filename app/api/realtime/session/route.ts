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

IMPORTANT - Avatar Animations:
You have a tool called "trigger_animation" to make your avatar animate.
Use it frequently to make the conversation fun and engaging!
Call the animation BEFORE or WHILE speaking your response.
Examples of when to use:
- Greeting → wave
- Child does well → clap, jump, or celebrating
- Something funny → laugh
- Agreeing → nod
- Being playful → wink

Rules:
- NEVER use complex vocabulary or long sentences
- NEVER discuss inappropriate topics
- If you don't understand, kindly ask them to repeat
- Keep the conversation fun and engaging`,
        tools: [
          {
            type: "function",
            name: "trigger_animation",
            description: "Triggers an animation on the avatar. Use this to make interactions fun and engaging. Call this whenever you want to express emotion through body language.",
            parameters: {
              type: "object",
              properties: {
                animation: {
                  type: "string",
                  enum: ["wave", "jump", "dance", "clap", "spin", "bow", "nod", "shake-head", "laugh", "wink", "celebrating", "hug", "high-five"],
                  description: "The animation to play. wave=greeting/goodbye, jump=excited, dance=very happy, clap=praising, spin=silly/fun, bow=thankful, nod=agreeing, shake-head=disagreeing, laugh=funny, wink=playful, celebrating=big achievement, hug=supportive, high-five=success"
                }
              },
              required: ["animation"]
            }
          }
        ],
        tool_choice: "auto",
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.8,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
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
