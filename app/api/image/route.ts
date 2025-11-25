import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Ensure the prompt is child-friendly
    const safePrompt = `A cute, colorful, child-friendly cartoon illustration of: ${prompt}. Style: friendly, educational, no scary elements, bright colors.`;

    const imageUrl = await generateImage(safePrompt);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image API error:", error);
    return NextResponse.json(
      { error: "Oops! I couldn't create an image. Please try again! 🔄" },
      { status: 500 }
    );
  }
}
