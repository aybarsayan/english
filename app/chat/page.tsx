"use client";

import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          💬 Chat with AIB Buddy!
        </h1>
        <p className="text-gray-600">
          Let&apos;s talk in English! (Benimle İngilizce konuş!)
        </p>
      </div>

      <ChatInterface
        apiEndpoint="/api/chat"
        initialMessage="Hello, friend! 👋 I'm AIB Buddy! Ready to learn English together? 🌟 What would you like to talk about today? You can ask me anything!"
        placeholder="Type here... (Buraya yaz...)"
      />
    </div>
  );
}
