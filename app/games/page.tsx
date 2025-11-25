"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";

const games = [
  {
    id: "ispy",
    name: "I Spy",
    emoji: "👀",
    description: "Guess what I see!",
    descriptionTr: "Ne gördüğümü tahmin et!",
    color: "from-pink-400 to-red-400",
  },
  {
    id: "wordmatch",
    name: "Word Match",
    emoji: "🔤",
    description: "Match words and emojis!",
    descriptionTr: "Kelimeleri ve emojileri eşleştir!",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "simonsays",
    name: "Simon Says",
    emoji: "🙋",
    description: "Follow the commands!",
    descriptionTr: "Komutları takip et!",
    color: "from-green-400 to-emerald-400",
  },
  {
    id: "riddles",
    name: "Riddles",
    emoji: "🤔",
    description: "Solve fun puzzles!",
    descriptionTr: "Eğlenceli bulmacaları çöz!",
    color: "from-purple-400 to-violet-400",
  },
];

const gamePrompts: Record<string, string> = {
  ispy: "Let's play I Spy! 👀 I will describe something, and you guess what it is! Are you ready? (Ben bir şey tarif edeceğim, sen tahmin et!)",
  wordmatch: "Let's play Word Match! 🔤 I'll give you an emoji, and you tell me the English word! Ready? (Sana emoji vereceğim, sen İngilizce kelimeyi söyle!)",
  simonsays: "Let's play Simon Says! 🙋 I will give you commands. Only do them when I say 'Simon says'! Ready? (Komutlar vereceğim. Sadece 'Simon says' dediğimde yap!)",
  riddles: "Let's play Riddles! 🤔 I will ask you a puzzle, and you try to guess the answer! Ready? (Sana bir bulmaca soracağım, cevabı tahmin et!)",
};

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame);
    return (
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={handleBackToGames}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-all flex items-center gap-2"
        >
          ⬅️ Back to Games
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">{game?.emoji}</span>
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            {game?.name}
          </h1>
          <p className="text-gray-600">{game?.description}</p>
        </div>

        <ChatInterface
          apiEndpoint="/api/chat"
          initialMessage={gamePrompts[selectedGame]}
          placeholder="Type your answer... (Cevabını yaz...)"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-500 mb-2">
          🎮 Game Time!
        </h1>
        <p className="text-gray-600">
          Choose a game to play! (Oynamak için bir oyun seç!)
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game.id)}
            className={`card-hover bg-gradient-to-br ${game.color} rounded-2xl p-8 text-white text-center shadow-lg`}
          >
            <div className="text-6xl mb-4">{game.emoji}</div>
            <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
            <p className="opacity-90">{game.description}</p>
            <p className="text-sm opacity-75 mt-1">({game.descriptionTr})</p>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-pink-50 rounded-2xl p-6 border-2 border-pink-200">
          <h3 className="font-bold text-pink-700 mb-3">🎯 How to Play:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>I Spy:</strong> I describe something, you guess! (Ben tarif ediyorum, sen tahmin et!)</li>
            <li>• <strong>Word Match:</strong> Match emojis to English words! (Emojileri İngilizce kelimelere eşle!)</li>
            <li>• <strong>Simon Says:</strong> Follow commands when Simon says! (Simon deyince komutları uygula!)</li>
            <li>• <strong>Riddles:</strong> Solve fun English puzzles! (Eğlenceli İngilizce bulmacaları çöz!)</li>
          </ul>
        </div>
      </div>

      {/* Fun Message */}
      <div className="mt-8 text-center">
        <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow">
          <span className="text-2xl mr-2">🎉</span>
          <span className="font-bold text-gray-700">Learning is fun when you play!</span>
          <span className="text-2xl ml-2">🎉</span>
        </div>
      </div>
    </div>
  );
}
