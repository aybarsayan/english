"use client";

import { useState, useEffect } from "react";
import QuizCard from "@/components/QuizCard";

interface QuizOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  emoji: string;
  options: QuizOption[];
  explanation: string;
  category: string;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load quizzes
    fetch("/api/quiz")
      .then((res) => res.json())
      .then((data) => {
        if (data.quizzes) {
          // Shuffle quizzes
          const shuffled = [...data.quizzes].sort(() => Math.random() - 0.5);
          setQuizzes(shuffled);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setTotalAnswered((prev) => prev + 1);
  };

  const nextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Shuffle and restart
      const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
      setQuizzes(shuffled);
      setCurrentIndex(0);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setTotalAnswered(0);
    setCurrentIndex(0);
    const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
    setQuizzes(shuffled);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl animate-bounce-slow mb-4">❓</div>
        <p className="text-xl text-gray-600">Loading quizzes...</p>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
          ❓ Quiz Time!
        </h1>
        <p className="text-gray-600">
          Test your English! (İngilizceni test et!)
        </p>
      </div>

      {/* Score Display */}
      <div className="max-w-lg mx-auto mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-2xl font-bold text-green-500">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Question</p>
            <p className="text-2xl font-bold text-blue-500">
              {currentIndex + 1}/{quizzes.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Accuracy</p>
            <p className="text-2xl font-bold text-purple-500">
              {totalAnswered > 0
                ? Math.round((score / totalAnswered) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      {currentQuiz && (
        <QuizCard
          question={currentQuiz.question}
          options={currentQuiz.options}
          emoji={currentQuiz.emoji}
          onAnswer={handleAnswer}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={nextQuestion}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Next Question ➡️
        </button>
        <button
          onClick={resetQuiz}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-full shadow hover:bg-gray-300 transition-all"
        >
          Start Over 🔄
        </button>
      </div>

      {/* Achievement Messages */}
      {score >= 5 && (
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 text-center border-2 border-yellow-300">
            <span className="text-4xl block mb-2">🏆</span>
            <h3 className="text-xl font-bold text-yellow-700">
              Amazing Job! You&apos;re a superstar!
            </h3>
            <p className="text-gray-600 mt-2">
              Keep practicing to learn more! (Daha fazla öğrenmek için pratik yapmaya devam et!)
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
          <h3 className="font-bold text-orange-700 mb-3">🎯 Quiz Tips:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Read each question carefully (Her soruyu dikkatli oku)</li>
            <li>• Don&apos;t worry if you make mistakes (Hata yaparsan endişelenme)</li>
            <li>• Learn from every question! (Her sorudan öğren!)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
