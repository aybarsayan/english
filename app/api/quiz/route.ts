import { NextRequest, NextResponse } from "next/server";
import { getJSONCompletion } from "@/lib/openai";
import { QUIZ_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { category = "animals", difficulty = "easy" } = await request.json();

    const userMessage = `Create a ${difficulty} quiz question about "${category}" for young English learners.`;

    const quiz = await getJSONCompletion(QUIZ_PROMPT, userMessage);

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Oops! I couldn't create a quiz. Please try again! 🔄" },
      { status: 500 }
    );
  }
}

// Default quizzes for when API is not available
export async function GET() {
  const quizzes = [
    {
      question: "What color is a banana? 🍌",
      emoji: "🍌",
      category: "colors",
      options: [
        { label: "A", text: "Yellow", isCorrect: true },
        { label: "B", text: "Blue", isCorrect: false },
        { label: "C", text: "Red", isCorrect: false },
      ],
      explanation: "A banana is yellow! 🍌💛",
    },
    {
      question: "What animal says 'meow'? 🐱",
      emoji: "🐱",
      category: "animals",
      options: [
        { label: "A", text: "Dog", isCorrect: false },
        { label: "B", text: "Cat", isCorrect: true },
        { label: "C", text: "Bird", isCorrect: false },
      ],
      explanation: "A cat says 'meow'! 🐱",
    },
    {
      question: "How many legs does a dog have? 🐕",
      emoji: "🐕",
      category: "numbers",
      options: [
        { label: "A", text: "Two", isCorrect: false },
        { label: "B", text: "Four", isCorrect: true },
        { label: "C", text: "Six", isCorrect: false },
      ],
      explanation: "A dog has four legs! 🐕🦵🦵🦵🦵",
    },
    {
      question: "What do we drink from a glass? 🥛",
      emoji: "🥛",
      category: "food",
      options: [
        { label: "A", text: "Bread", isCorrect: false },
        { label: "B", text: "Apple", isCorrect: false },
        { label: "C", text: "Milk", isCorrect: true },
      ],
      explanation: "We drink milk from a glass! 🥛",
    },
    {
      question: "What is the opposite of 'big'? 📏",
      emoji: "📏",
      category: "adjectives",
      options: [
        { label: "A", text: "Small", isCorrect: true },
        { label: "B", text: "Tall", isCorrect: false },
        { label: "C", text: "Fast", isCorrect: false },
      ],
      explanation: "The opposite of big is small! 📏",
    },
    {
      question: "What color is grass? 🌿",
      emoji: "🌿",
      category: "colors",
      options: [
        { label: "A", text: "Red", isCorrect: false },
        { label: "B", text: "Green", isCorrect: true },
        { label: "C", text: "Yellow", isCorrect: false },
      ],
      explanation: "Grass is green! 🌿💚",
    },
    {
      question: "What animal can fly? 🐦",
      emoji: "🐦",
      category: "animals",
      options: [
        { label: "A", text: "Fish", isCorrect: false },
        { label: "B", text: "Dog", isCorrect: false },
        { label: "C", text: "Bird", isCorrect: true },
      ],
      explanation: "A bird can fly! 🐦✈️",
    },
    {
      question: "How do you say 'merhaba' in English? 👋",
      emoji: "👋",
      category: "greetings",
      options: [
        { label: "A", text: "Goodbye", isCorrect: false },
        { label: "B", text: "Hello", isCorrect: true },
        { label: "C", text: "Thank you", isCorrect: false },
      ],
      explanation: "Merhaba = Hello! 👋",
    },
  ];

  return NextResponse.json({
    quizzes,
    message: "Here are some fun quizzes for you! 🎯",
  });
}
