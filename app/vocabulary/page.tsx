"use client";

import { useState, useEffect } from "react";
import VocabularyCard from "@/components/VocabularyCard";

interface Word {
  word: string;
  turkish: string;
  pronunciation: string;
  example: string;
  emoji: string;
}

interface VocabularyData {
  category: string;
  words: Word[];
}

const categories = [
  { value: "animals", label: "Animals 🐾" },
  { value: "colors", label: "Colors 🎨" },
  { value: "numbers", label: "Numbers 🔢" },
  { value: "family", label: "Family 👨‍👩‍👧‍👦" },
  { value: "food", label: "Food 🍎" },
];

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("animals");
  const [allCategories, setAllCategories] = useState<Record<string, VocabularyData>>({});

  useEffect(() => {
    // Load default vocabulary
    fetch("/api/vocabulary")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultCategory) {
          setVocabulary(data.defaultCategory);
        }
      })
      .catch(console.error);
  }, []);

  const loadVocabulary = async (category: string) => {
    // Check if we already have this category cached
    if (allCategories[category]) {
      setVocabulary(allCategories[category]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      const data = await response.json();

      if (data.error) {
        // Fallback to default
        const defaultResponse = await fetch("/api/vocabulary");
        const defaultData = await defaultResponse.json();
        setVocabulary(defaultData.defaultCategory);
      } else {
        setVocabulary(data);
        setAllCategories((prev) => ({ ...prev, [category]: data }));
      }
    } catch {
      console.error("Error loading vocabulary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadVocabulary(category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
          📝 Learn New Words!
        </h1>
        <p className="text-gray-600">
          Tap the cards to see the meaning! (Anlamı görmek için kartlara dokun!)
        </p>
      </div>

      {/* Category Selection */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.value
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl animate-bounce-slow mb-4">📚</div>
          <p className="text-gray-600 font-medium">Loading words...</p>
        </div>
      )}

      {/* Vocabulary Cards */}
      {!isLoading && vocabulary && (
        <>
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
              Category: {vocabulary.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {vocabulary.words.map((word, index) => (
              <VocabularyCard
                key={index}
                word={word.word}
                turkish={word.turkish}
                pronunciation={word.pronunciation}
                example={word.example}
                emoji={word.emoji}
              />
            ))}
          </div>
        </>
      )}

      {/* Tips Section */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="font-bold text-yellow-700 mb-3">💡 Learning Tips:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Say each word 3 times (Her kelimeyi 3 kez söyle)</li>
            <li>• Write the words in a notebook (Kelimeleri deftere yaz)</li>
            <li>• Use new words in sentences (Yeni kelimeleri cümlelerde kullan)</li>
            <li>• Practice every day! (Her gün pratik yap!)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
