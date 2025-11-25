"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Mascot from "@/components/Mascot";
import { useVoice } from "@/lib/useVoice";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<"happy" | "thinking" | "speaking" | "listening" | "celebrating">("happy");
  const [textInput, setTextInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
    resetTranscript,
    isSupported,
    error,
    clearError,
  } = useVoice();

  // Update mascot mood based on state
  useEffect(() => {
    if (isListening) {
      setMascotMood("listening");
    } else if (isSpeaking) {
      setMascotMood("speaking");
    } else if (isLoading) {
      setMascotMood("thinking");
    } else {
      setMascotMood("happy");
    }
  }, [isListening, isSpeaking, isLoading]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setHasStarted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    resetTranscript();
    setTextInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.isUser ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      const botResponse = data.response || "Sorry, I did not understand. Can you try again?";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (
        botResponse.toLowerCase().includes("excellent") ||
        botResponse.toLowerCase().includes("great job") ||
        botResponse.toLowerCase().includes("superstar") ||
        botResponse.toLowerCase().includes("amazing")
      ) {
        setMascotMood("celebrating");
        setTimeout(() => setMascotMood("speaking"), 1000);
      }

      speak(botResponse);
    } catch {
      const errorMessage = "Oops! Something went wrong. Please try again!";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
        },
      ]);
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, resetTranscript, speak]);

  // Handle voice input completion
  useEffect(() => {
    if (!isListening && transcript) {
      sendMessage(transcript);
    }
  }, [isListening, transcript, sendMessage]);

  const handleMicClick = () => {
    clearError();
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleMascotClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (!hasStarted) {
      const welcomeMessage = "Hello! I am Kai, your English learning friend! Tap the microphone button and talk to me!";
      speak(welcomeMessage);
      setMessages([{ id: "welcome", text: welcomeMessage, isUser: false }]);
      setHasStarted(true);
    } else if (messages.length > 0) {
      const lastBotMessage = [...messages].reverse().find((m) => !m.isUser);
      if (lastBotMessage) {
        speak(lastBotMessage.text);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Large Mascot */}
        <div className="mb-4">
          <Mascot mood={mascotMood} size="xlarge" onClick={handleMascotClick} />
        </div>

        {/* Mascot Name */}
        <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">Kai</h1>
        <p className="text-gray-600 mb-6 text-center">
          {isSpeaking ? "Speaking..." : hasStarted ? "Tap me to hear again!" : "Tap me or the microphone to start!"}
        </p>

        {/* Speech Bubble - Shows conversation */}
        {hasStarted && messages.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-xl max-w-md w-full mb-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {messages.slice(-2).map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-xl text-sm ${
                    message.isUser
                      ? "bg-blue-100 text-blue-800 ml-8"
                      : "bg-purple-100 text-purple-800 mr-8"
                  }`}
                >
                  <span className="font-medium">{message.isUser ? "You: " : "Kai: "}</span>
                  {message.text}
                </div>
              ))}
              {isLoading && (
                <div className="bg-purple-100 text-purple-800 p-2 rounded-xl text-sm mr-8">
                  <span className="font-medium">Kai: </span>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
              {isListening && (
                <div className="bg-green-100 text-green-800 p-2 rounded-xl text-sm">
                  <span className="font-medium">Listening: </span>
                  {transcript || "Say something..."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 rounded-xl p-3 mb-4 max-w-md w-full text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Big Microphone Button */}
        <button
          onClick={handleMicClick}
          disabled={isLoading}
          className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-200 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
              : "bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 hover:scale-105"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-14 md:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isListening ? (
              <rect x="6" y="6" width="12" height="12" strokeWidth={2} fill="white" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>
        <p className="text-gray-600 font-medium mt-3 text-lg">
          {isListening ? "Tap to stop" : "Tap to talk"}
        </p>

        {/* Text Input */}
        <form onSubmit={handleTextSubmit} className="mt-6 w-full max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type here..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700"
              disabled={isLoading || isListening}
            />
            <button
              type="submit"
              disabled={isLoading || isListening || !textInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>

        {/* Quick Phrases */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
          {["Hello!", "How are you?", "What is your name?", "Thank you!"].map((phrase) => (
            <button
              key={phrase}
              onClick={() => sendMessage(phrase)}
              disabled={isLoading || isListening}
              className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-600 shadow hover:shadow-md hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation - Mode Links */}
      <div className="bg-white/80 backdrop-blur border-t border-gray-200 py-4 px-4">
        <div className="flex justify-center gap-4 md:gap-8 max-w-2xl mx-auto">
          <Link href="/chat" className="flex flex-col items-center text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Chat</span>
          </Link>
          <Link href="/story" className="flex flex-col items-center text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xs font-medium">Stories</span>
          </Link>
          <Link href="/vocabulary" className="flex flex-col items-center text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-medium">Words</span>
          </Link>
          <Link href="/quiz" className="flex flex-col items-center text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Quiz</span>
          </Link>
          <Link href="/games" className="flex flex-col items-center text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Games</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-2 text-gray-400 text-xs">
        AIB Course - Kariyer Koleji, Ankara
      </div>
    </div>
  );
}
