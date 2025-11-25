"use client";

import VoiceChat from "@/components/VoiceChat";

export default function TalkPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          🎤 Talk with Buddy!
        </h1>
        <p className="text-gray-600">
          Practice speaking English! (İngilizce konuşma pratiği yap!)
        </p>
      </div>

      <VoiceChat />
    </div>
  );
}
