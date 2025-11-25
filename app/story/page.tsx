"use client";

import { useState, useEffect } from "react";
import StoryDisplay from "@/components/StoryDisplay";

interface Story {
  title: string;
  content: string;
  emoji: string;
  moral: string;
}

const storyTopics = [
  { value: "animals", label: "Animals 🐾", emoji: "🐾" },
  { value: "friendship", label: "Friendship 🤝", emoji: "🤝" },
  { value: "adventure", label: "Adventure 🗺️", emoji: "🗺️" },
  { value: "kindness", label: "Kindness 💖", emoji: "💖" },
  { value: "nature", label: "Nature 🌿", emoji: "🌿" },
];

export default function StoryPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("animals");
  const [defaultStories, setDefaultStories] = useState<Story[]>([]);

  useEffect(() => {
    // Load default stories
    fetch("/api/story")
      .then((res) => res.json())
      .then((data) => {
        if (data.stories) {
          setDefaultStories(data.stories);
          setStory(data.stories[0]);
        }
      })
      .catch(console.error);
  }, []);

  const generateStory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });

      const data = await response.json();

      if (data.error) {
        // Use a default story if API fails
        const randomStory = defaultStories[Math.floor(Math.random() * defaultStories.length)];
        setStory(randomStory || null);
      } else {
        setStory(data);
      }
    } catch {
      // Use a default story on error
      const randomStory = defaultStories[Math.floor(Math.random() * defaultStories.length)];
      setStory(randomStory || null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
          📖 Story Time!
        </h1>
        <p className="text-gray-600">
          Read fun stories in English! (Eğlenceli hikayeler oku!)
        </p>
      </div>

      {/* Topic Selection */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
            Choose a topic: (Bir konu seç:)
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {storyTopics.map((topic) => (
              <button
                key={topic.value}
                onClick={() => setSelectedTopic(topic.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedTopic === topic.value
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={generateStory}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🔄</span> Creating story...
                </span>
              ) : (
                "✨ New Story!"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Story Display */}
      {story && (
        <StoryDisplay
          title={story.title}
          content={story.content}
          emoji={story.emoji}
          moral={story.moral}
        />
      )}

      {/* Reading Tips */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="font-bold text-blue-700 mb-3">📚 Reading Tips:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Read slowly and carefully (Yavaş ve dikkatli oku)</li>
            <li>• Try to say the words out loud (Kelimeleri sesli söyle)</li>
            <li>• Ask your teacher about new words (Yeni kelimeler için öğretmenine sor)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
