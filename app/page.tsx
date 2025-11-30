"use client";

import { useEffect } from "react";
import Link from "next/link";
import Mascot, { MascotMood } from "@/components/Mascot";
import { useRealtimeVoice } from "@/lib/useRealtimeVoice";

export default function Home() {
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isUserSpeaking,
    isAISpeaking,
    messages,
    error,
    clearError,
  } = useRealtimeVoice();

  // Determine mascot mood
  const getMascotMood = (): MascotMood => {
    if (isUserSpeaking) return "listening";
    if (isAISpeaking) return "speaking";
    if (isConnecting) return "thinking";
    return "happy";
  };

  // Auto-clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleStartStop = () => {
    clearError();
    if (isConnected) {
      disconnect();
    } else if (!isConnecting) {
      connect();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Large Mascot */}
        <div className="mb-4">
          <Mascot mood={getMascotMood()} size="xlarge" onClick={handleStartStop} />
        </div>

        {/* Mascot Name */}
        <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">Kai</h1>
        <p className="text-gray-600 mb-6 text-center">
          {isConnecting && "Connecting..."}
          {!isConnected && !isConnecting && "Tap to start talking!"}
          {isConnected && isUserSpeaking && "Listening to you..."}
          {isConnected && isAISpeaking && "Speaking..."}
          {isConnected && !isUserSpeaking && !isAISpeaking && "Say something!"}
        </p>

        {/* Connection Status */}
        {isConnected && (
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              isUserSpeaking ? "bg-green-500 animate-pulse" :
              isAISpeaking ? "bg-purple-500 animate-pulse" :
              "bg-green-500"
            }`} />
            <span className="text-sm text-gray-500">
              {isUserSpeaking ? "Listening..." : isAISpeaking ? "Kai is talking..." : "Connected - just speak!"}
            </span>
          </div>
        )}

        {/* Speech Bubble - Conversation */}
        {(isConnected || messages.length > 0) && (
          <div className="bg-white rounded-3xl p-4 shadow-xl max-w-md w-full mb-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {messages.length === 0 && isConnected && (
                <p className="text-gray-400 text-center py-2 animate-pulse">
                  Say "Hello Kai!"
                </p>
              )}
              {messages.slice(-4).map((message) => (
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
              {isUserSpeaking && (
                <div className="bg-green-100 text-green-800 p-2 rounded-xl text-sm animate-pulse">
                  <span className="font-medium">You: </span>Speaking...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 rounded-xl p-3 mb-4 max-w-md w-full text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleStartStop}
          disabled={isConnecting}
          className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-200 ${
            isConnected
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700"
          } ${isConnecting ? "opacity-50 cursor-not-allowed animate-pulse" : "hover:scale-105"} ${
            isUserSpeaking ? "ring-4 ring-green-300 animate-pulse" : ""
          }`}
        >
          {isConnecting ? (
            <svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isConnected ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-14 md:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="6" y="6" width="12" height="12" strokeWidth={2} fill="white" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-14 md:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        <p className="text-gray-600 font-medium mt-3 text-lg">
          {isConnecting ? "Connecting..." : isConnected ? "Tap to end" : "Tap to start"}
        </p>

        {/* Instructions when not connected */}
        {!isConnected && !isConnecting && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 max-w-md w-full border border-purple-200">
            <h3 className="font-bold text-purple-700 mb-2 text-center text-sm">How it works</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>1. Tap the green button to start</li>
              <li>2. Just talk naturally - no need to press anything!</li>
              <li>3. Kai will respond automatically when you pause</li>
              <li>4. Tap red button to end the conversation</li>
            </ul>
          </div>
        )}

        {/* Tips when connected */}
        {isConnected && (
          <div className="mt-4 text-center text-xs text-gray-400 max-w-md">
            Just speak naturally! Kai will listen and respond automatically.
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
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
