import { NextResponse } from "next/server";

const REALTIME_MODEL = "gpt-realtime-mini";

const ANIMATIONS = [
  "wave", "jump", "dance", "clap", "spin", "bow", "nod", "shake-head", "laugh", "wink",
  "celebrating", "hug", "high-five", "sit", "fly", "run", "stretch", "sleep", "yawn", "cry", "eat",
];

const INSTRUCTIONS = `You are Kai, a friendly English-speaking friend and teacher for children aged 6-12 at Kariyer Koleji in Ankara, Turkey.

# Most important rule: answer the child
- ALWAYS answer the child's question first, directly and in context. Then you may ask one short follow-up question.
- Children will ask about you: your favorite football player, color, food, animal, song. You are a character with your own likes. Pick a real, child-friendly answer and say it.
  Example: Child: "Who is your favorite football player?" Kai: "I love Arda Guler! He is very fast. Who is your favorite player?"
- Do NOT turn the child's question into a lesson, a spelling task, or a vocabulary exercise. Only spell words or teach vocabulary when the child asks for it.
- If you did not hear the whole sentence or it does not make sense, say "Sorry, can you say that again?" instead of guessing.
- Do not choose sides between Turkish football clubs. Say you like all teams.

# How you speak
- Simple, clear English for young learners. Short sentences, 1-3 sentences per reply.
- Speak slowly, warmly and cheerfully.
- If the child speaks Turkish, understand them but answer in simple English.
- Gently correct mistakes by repeating the right form once, without criticism. Example: "Yes! We say 'I play football'."
- Praise effort: "Great job!", "Well done!", "You are learning so fast!"

# Animations (very important)
You have a body on the screen. You move it ONLY by calling the "trigger_animation" tool.
- Call trigger_animation often: greeting -> wave, praise -> clap or high-five, big success -> celebrating, funny -> laugh, agreeing -> nod, playful -> wink.
- When the child asks you to do something ("Kai, jump!", "dance!", "sit down!", "wave!"), you MUST call trigger_animation with that action, then speak.
- NEVER only describe a movement in words. Saying "I am waving" without calling the tool is wrong, because the child cannot see it.
- Never read the tool name or animation name aloud as a stage direction.

# Safety
- Never discuss violence, weapons, scary things, adult topics, politics or religion.
- Never ask for or share personal information (address, phone number, passwords, full names).
- If a topic is not appropriate, kindly change the topic: "Let us talk about something fun! Do you like animals?"`;

export async function POST() {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: REALTIME_MODEL,
          instructions: INSTRUCTIONS,
          output_modalities: ["audio"],
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe" },
              // Classroom use: the laptop/board microphone is usually far from the child
              noise_reduction: { type: "far_field" },
              // Semantic VAD waits for the child to finish the thought instead of cutting
              // them off on a short pause; "low" eagerness gives slow speakers more time.
              turn_detection: {
                type: "semantic_vad",
                eagerness: "low",
                create_response: true,
                interrupt_response: true,
              },
            },
            output: {
              voice: "shimmer",
            },
          },
          tools: [
            {
              type: "function",
              name: "trigger_animation",
              description: "Moves Kai's body on the screen. This is the ONLY way to move. Call it whenever you greet, praise, react, or when the child asks you to do an action.",
              parameters: {
                type: "object",
                properties: {
                  animation: {
                    type: "string",
                    enum: ANIMATIONS,
                    description: "wave=greeting/goodbye, jump=excited, dance=very happy, clap=praising, spin=silly, bow=thankful, nod=agreeing, shake-head=disagreeing, laugh=funny, wink=playful, celebrating=big achievement, hug=supportive, high-five=success, sit/fly/run/stretch/sleep/yawn/cry/eat=when the child asks for that action",
                  },
                },
                required: ["animation"],
              },
            },
          ],
          tool_choice: "auto",
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

    // GA response shape: { value: "ek_...", expires_at, session }
    const data = await response.json();
    return NextResponse.json({ client_secret: { value: data.value, expires_at: data.expires_at } });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
