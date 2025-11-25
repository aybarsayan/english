"use client";

import { useState } from "react";

interface VocabularyCardProps {
  word: string;
  turkish: string;
  pronunciation: string;
  example: string;
  emoji: string;
}

export default function VocabularyCard({
  word,
  turkish,
  pronunciation,
  example,
  emoji,
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="cursor-pointer perspective-1000"
    >
      <div
        className={`relative w-full h-64 transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-6xl mb-4">{emoji}</span>
          <h3 className="text-3xl font-bold mb-2">{word}</h3>
          <p className="text-lg opacity-80">({pronunciation})</p>
          <p className="text-sm mt-4 opacity-70">👆 Tap to see meaning!</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-xl font-bold mb-2">Turkish:</p>
          <p className="text-2xl mb-4">{turkish}</p>
          <p className="text-sm font-bold mb-1">Example:</p>
          <p className="text-center italic">&quot;{example}&quot;</p>
          <p className="text-sm mt-4 opacity-70">👆 Tap to flip back!</p>
        </div>
      </div>
    </div>
  );
}
