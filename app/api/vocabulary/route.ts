import { NextRequest, NextResponse } from "next/server";
import { getJSONCompletion } from "@/lib/openai";
import { VOCABULARY_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { category = "animals", count = 5 } = await request.json();

    const userMessage = `Give me ${count} simple vocabulary words about "${category}" for young learners. Include Turkish translations.`;

    const vocabulary = await getJSONCompletion(VOCABULARY_PROMPT, userMessage);

    return NextResponse.json(vocabulary);
  } catch (error) {
    console.error("Vocabulary API error:", error);
    return NextResponse.json(
      { error: "Oops! I couldn't get words. Please try again! 🔄" },
      { status: 500 }
    );
  }
}

// Default vocabulary for when API is not available
export async function GET() {
  const categories = {
    animals: {
      category: "Animals",
      words: [
        { word: "CAT", turkish: "kedi", pronunciation: "KAT", example: "I have a cat.", emoji: "🐱" },
        { word: "DOG", turkish: "köpek", pronunciation: "DOG", example: "The dog is big.", emoji: "🐕" },
        { word: "BIRD", turkish: "kuş", pronunciation: "BÖRD", example: "The bird can fly.", emoji: "🐦" },
        { word: "FISH", turkish: "balık", pronunciation: "FİŞ", example: "The fish swims.", emoji: "🐟" },
        { word: "RABBIT", turkish: "tavşan", pronunciation: "RAB-it", example: "The rabbit is white.", emoji: "🐰" },
      ],
    },
    colors: {
      category: "Colors",
      words: [
        { word: "RED", turkish: "kırmızı", pronunciation: "RED", example: "The apple is red.", emoji: "🔴" },
        { word: "BLUE", turkish: "mavi", pronunciation: "BLU", example: "The sky is blue.", emoji: "🔵" },
        { word: "GREEN", turkish: "yeşil", pronunciation: "GRİN", example: "The grass is green.", emoji: "🟢" },
        { word: "YELLOW", turkish: "sarı", pronunciation: "YEL-o", example: "The sun is yellow.", emoji: "🟡" },
        { word: "ORANGE", turkish: "turuncu", pronunciation: "OR-inç", example: "The orange is orange.", emoji: "🟠" },
      ],
    },
    numbers: {
      category: "Numbers",
      words: [
        { word: "ONE", turkish: "bir", pronunciation: "VAN", example: "I have one apple.", emoji: "1️⃣" },
        { word: "TWO", turkish: "iki", pronunciation: "TU", example: "I see two cats.", emoji: "2️⃣" },
        { word: "THREE", turkish: "üç", pronunciation: "TRİ", example: "Three birds fly.", emoji: "3️⃣" },
        { word: "FOUR", turkish: "dört", pronunciation: "FOR", example: "Four dogs play.", emoji: "4️⃣" },
        { word: "FIVE", turkish: "beş", pronunciation: "FAİV", example: "I have five books.", emoji: "5️⃣" },
      ],
    },
    family: {
      category: "Family",
      words: [
        { word: "MOTHER", turkish: "anne", pronunciation: "MAD-ır", example: "My mother is kind.", emoji: "👩" },
        { word: "FATHER", turkish: "baba", pronunciation: "FAD-ır", example: "My father is tall.", emoji: "👨" },
        { word: "SISTER", turkish: "kız kardeş", pronunciation: "SİS-tır", example: "My sister is young.", emoji: "👧" },
        { word: "BROTHER", turkish: "erkek kardeş", pronunciation: "BRAD-ır", example: "My brother is funny.", emoji: "👦" },
        { word: "BABY", turkish: "bebek", pronunciation: "BEY-bi", example: "The baby is cute.", emoji: "👶" },
      ],
    },
    food: {
      category: "Food",
      words: [
        { word: "APPLE", turkish: "elma", pronunciation: "AP-ıl", example: "I eat an apple.", emoji: "🍎" },
        { word: "BREAD", turkish: "ekmek", pronunciation: "BRED", example: "I like bread.", emoji: "🍞" },
        { word: "MILK", turkish: "süt", pronunciation: "MİLK", example: "I drink milk.", emoji: "🥛" },
        { word: "BANANA", turkish: "muz", pronunciation: "bı-NA-nı", example: "The banana is yellow.", emoji: "🍌" },
        { word: "WATER", turkish: "su", pronunciation: "VO-tır", example: "I drink water.", emoji: "💧" },
      ],
    },
  };

  return NextResponse.json({
    categories: Object.keys(categories),
    defaultCategory: categories.animals,
  });
}
