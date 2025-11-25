import { NextRequest, NextResponse } from "next/server";
import { getJSONCompletion } from "@/lib/openai";
import { STORY_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { topic = "animals", grade = "1-2" } = await request.json();

    const userMessage = `Create a simple story about "${topic}" for grade ${grade} students. Remember to keep it very simple and fun!`;

    const story = await getJSONCompletion(STORY_PROMPT, userMessage);

    return NextResponse.json(story);
  } catch (error) {
    console.error("Story API error:", error);
    return NextResponse.json(
      { error: "Oops! I couldn't create a story. Please try again! 🔄" },
      { status: 500 }
    );
  }
}

// Default stories for when API is not available
export async function GET() {
  const defaultStories = [
    {
      title: "The Happy Cat",
      emoji: "🐱",
      content: `Once upon a time, there was a little cat. 🐱
The cat was orange and fluffy.
The cat liked to play every day.

"Hello!" said the cat. "I like to play!"
The cat played with a ball. 🎾
The ball was red.

The cat was very happy! 😊
The end.`,
      moral: "Playing makes us happy! 🌟",
    },
    {
      title: "The Little Bird",
      emoji: "🐦",
      content: `A little bird lived in a big tree. 🌳
The bird could sing very well.
Every morning, the bird sang a song.

"Tweet tweet!" sang the bird. 🎵
All the animals listened.
They liked the song very much!

The bird was proud. 🌟
The end.`,
      moral: "Sharing your talents makes others happy! ⭐",
    },
  ];

  return NextResponse.json({
    stories: defaultStories,
    message: "Here are some fun stories for you! 📖",
  });
}
