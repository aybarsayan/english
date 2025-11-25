import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function getChatCompletion(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "I couldn't think of a response. Try again! 🔄";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get response from AI");
  }
}

export async function getJSONCompletion(
  systemPrompt: string,
  userMessage: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get response from AI");
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Child-friendly, colorful, cartoon style illustration for elementary school students: ${prompt}. Make it cute, friendly, and educational. No scary or violent elements.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL in response");
    }
    return imageUrl;
  } catch (error) {
    console.error("OpenAI Image API error:", error);
    throw new Error("Failed to generate image");
  }
}
