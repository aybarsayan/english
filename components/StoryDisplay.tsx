"use client";

interface StoryDisplayProps {
  title: string;
  content: string;
  emoji?: string;
  moral?: string;
}

export default function StoryDisplay({
  title,
  content,
  emoji = "📖",
  moral,
}: StoryDisplayProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="text-6xl block mb-4 animate-bounce-slow">{emoji}</span>
        <h2 className="text-2xl md:text-3xl font-bold text-purple-600">
          {title}
        </h2>
      </div>

      {/* Story Content */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
        <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Moral */}
      {moral && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border-l-4 border-yellow-500">
          <p className="font-bold text-yellow-800 mb-1">🌟 Lesson:</p>
          <p className="text-gray-700">{moral}</p>
        </div>
      )}

      {/* Fun Decorations */}
      <div className="flex justify-center gap-4 mt-6 text-3xl">
        <span className="animate-float" style={{ animationDelay: "0s" }}>⭐</span>
        <span className="animate-float" style={{ animationDelay: "0.5s" }}>🌟</span>
        <span className="animate-float" style={{ animationDelay: "1s" }}>✨</span>
      </div>
    </div>
  );
}
