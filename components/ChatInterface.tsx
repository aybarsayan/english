"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  apiEndpoint?: string;
  initialMessage?: string;
  placeholder?: string;
}

export default function ChatInterface({
  apiEndpoint = "/api/chat",
  initialMessage = "Hello, friend! 👋 I'm AIB Buddy! Ready to learn English together? 🌟 What would you like to do today?",
  placeholder = "Type your message here... (Mesajını buraya yaz...)",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: initialMessage,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.map((m) => ({
            role: m.isUser ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Oops! Something went wrong. Try again! 🔄",
        isUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Oops! I couldn't respond. Please try again! 🔄",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    "Hello! 👋",
    "Tell me a story 📖",
    "Teach me a word 📝",
    "Let's play! 🎮",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 backdrop-blur rounded-t-3xl">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
          />
        ))}
        {isLoading && <MessageBubble message="" isUser={false} isLoading />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 bg-white/70 backdrop-blur flex gap-2 overflow-x-auto">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => setInput(reply)}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700 hover:from-blue-200 hover:to-purple-200 transition-all"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white/90 backdrop-blur rounded-b-3xl shadow-lg"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-gray-700 font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Send 📨
          </button>
        </div>
      </form>
    </div>
  );
}
