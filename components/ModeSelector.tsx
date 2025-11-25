"use client";

import Link from "next/link";

const modes = [
  {
    href: "/talk",
    title: "Talk",
    titleTr: "Konuş",
    emoji: "🎤",
    description: "Speak with Buddy!",
    color: "from-violet-500 to-purple-600",
    featured: true,
  },
  {
    href: "/chat",
    title: "Chat",
    titleTr: "Sohbet",
    emoji: "💬",
    description: "Type with me!",
    color: "from-blue-400 to-blue-600",
  },
  {
    href: "/story",
    title: "Stories",
    titleTr: "Hikaye",
    emoji: "📖",
    description: "Read fun stories!",
    color: "from-purple-400 to-purple-600",
  },
  {
    href: "/vocabulary",
    title: "Words",
    titleTr: "Kelime",
    emoji: "📝",
    description: "Learn new words!",
    color: "from-green-400 to-green-600",
  },
  {
    href: "/quiz",
    title: "Quiz",
    titleTr: "Test",
    emoji: "❓",
    description: "Test your knowledge!",
    color: "from-yellow-400 to-orange-500",
  },
  {
    href: "/games",
    title: "Games",
    titleTr: "Oyun",
    emoji: "🎮",
    description: "Play and learn!",
    color: "from-pink-400 to-red-500",
  },
];

export default function ModeSelector() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
      {modes.map((mode) => (
        <Link
          key={mode.href}
          href={mode.href}
          className="group"
        >
          <div className={`card-hover bg-gradient-to-br ${mode.color} rounded-2xl p-6 text-white text-center shadow-lg`}>
            <div className="text-5xl mb-3 group-hover:animate-bounce-slow">
              {mode.emoji}
            </div>
            <h3 className="text-xl font-bold mb-1">{mode.title}</h3>
            <p className="text-sm opacity-90">({mode.titleTr})</p>
            <p className="text-xs mt-2 opacity-80">{mode.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
