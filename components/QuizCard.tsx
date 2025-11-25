"use client";

import { useState } from "react";

interface QuizOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  emoji?: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export default function QuizCard({
  question,
  options,
  emoji = "❓",
  onAnswer,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (label: string, isCorrect: boolean) => {
    if (showResult) return;
    setSelectedAnswer(label);
    setShowResult(true);
    onAnswer?.(isCorrect);
  };

  const getButtonStyle = (option: QuizOption) => {
    if (!showResult) {
      return "bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400";
    }

    if (option.isCorrect) {
      return "bg-green-100 border-2 border-green-500 text-green-700";
    }

    if (selectedAnswer === option.label && !option.isCorrect) {
      return "bg-red-100 border-2 border-red-500 text-red-700";
    }

    return "bg-gray-100 border-2 border-gray-300 opacity-50";
  };

  const reset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-lg mx-auto">
      {/* Question */}
      <div className="text-center mb-6">
        <span className="text-5xl mb-4 block">{emoji}</span>
        <h3 className="text-xl font-bold text-gray-800">{question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleSelect(option.label, option.isCorrect)}
            disabled={showResult}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all ${getButtonStyle(
              option
            )}`}
          >
            <span className="font-bold mr-2">{option.label})</span>
            {option.text}
            {showResult && option.isCorrect && (
              <span className="float-right">✅</span>
            )}
            {showResult &&
              selectedAnswer === option.label &&
              !option.isCorrect && <span className="float-right">❌</span>}
          </button>
        ))}
      </div>

      {/* Result Message */}
      {showResult && (
        <div className="mt-6 text-center">
          {options.find((o) => o.label === selectedAnswer)?.isCorrect ? (
            <div className="text-green-600">
              <p className="text-2xl font-bold">🎉 Excellent! 🌟</p>
              <p>You got it right!</p>
            </div>
          ) : (
            <div className="text-orange-600">
              <p className="text-2xl font-bold">Good try! 💪</p>
              <p>
                The correct answer is:{" "}
                <strong>{options.find((o) => o.isCorrect)?.text}</strong>
              </p>
            </div>
          )}
          <button
            onClick={reset}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg transition-all"
          >
            Try Again! 🔄
          </button>
        </div>
      )}
    </div>
  );
}
