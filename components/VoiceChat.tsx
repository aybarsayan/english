"use client";

import { useEffect, useMemo } from "react";
import Mascot from "./Mascot";
import { useRealtimeVoice } from "@/lib/useRealtimeVoice";

export default function VoiceChat() {
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
  const mascotMood = useMemo(() => {
    if (isUserSpeaking) return "listening";
    if (isAISpeaking) return "speaking";
    if (isConnecting) return "thinking";
    return "happy";
  }, [isUserSpeaking, isAISpeaking, isConnecting]);

  // Status text
  const statusText = useMemo(() => {
    if (isConnecting) return "Connecting...";
    if (!isConnected) return "Tap to start talking";
    if (isUserSpeaking) return "Listening to you...";
    if (isAISpeaking) return "Kai is speaking...";
    return "Listening... Say something!";
  }, [isConnected, isConnecting, isUserSpeaking, isAISpeaking]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleMainButtonClick = () => {
    clearError();
    if (isConnected) {
      disconnect();
    } else if (!isConnecting) {
      connect();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      {/* Mascot */}
      <div className="mb-6">
        <Mascot mood={mascotMood} size="large" />
        <p className="text-center text-sm text-gray-500 mt-2">
          {isAISpeaking ? "Speaking..." : isConnected ? "Tap mascot to stop" : "Meet Kai!"}
        </p>
      </div>

      {/* Connection Status Indicator */}
      {isConnected && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isUserSpeaking ? "bg-green-500 animate-pulse" : isAISpeaking ? "bg-purple-500 animate-pulse" : "bg-green-500"}`} />
          <span className="text-sm text-gray-600">{statusText}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4 mb-4 max-w-md w-full">
          <p className="text-red-700 text-center font-medium">{error}</p>
        </div>
      )}

      {/* Speech Bubble - Conversation History */}
      <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full mb-6 relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

        <div className="max-h-64 overflow-y-auto space-y-3">
          {messages.length === 0 && !isConnected && (
            <div className="text-center text-gray-400 py-4">
              <p>Tap the button below to start talking with Kai!</p>
            </div>
          )}

          {messages.length === 0 && isConnected && !isAISpeaking && (
            <div className="text-center text-gray-400 py-4">
              <p className="animate-pulse">Say hello to Kai!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-2xl ${
                message.isUser
                  ? "bg-blue-100 text-blue-800 ml-8"
                  : "bg-purple-100 text-purple-800 mr-8"
              }`}
            >
              <p className="text-sm font-medium">
                {message.isUser ? "You:" : "Kai:"}
              </p>
              <p>{message.text}</p>
            </div>
          ))}

          {/* Speaking indicators */}
          {isUserSpeaking && (
            <div className="bg-green-100 text-green-800 p-3 rounded-2xl animate-pulse">
              <p className="text-sm font-medium">You:</p>
              <p>Speaking...</p>
            </div>
          )}

          {isAISpeaking && messages.length > 0 && messages[messages.length - 1]?.isUser && (
            <div className="bg-purple-100 text-purple-800 p-3 rounded-2xl mr-8 animate-pulse">
              <p className="text-sm font-medium">Kai:</p>
              <p>Responding...</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Action Button */}
      <button
        onClick={handleMainButtonClick}
        disabled={isConnecting}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 ${
          isConnected
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
        } ${isConnecting ? "opacity-50 cursor-not-allowed animate-pulse" : "hover:scale-105"} ${
          isUserSpeaking ? "ring-4 ring-green-300 animate-pulse" : ""
        }`}
      >
        {isConnecting ? (
          <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isConnected ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="6" width="12" height="12" strokeWidth={2} fill="white" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <p className="text-center mt-3 text-gray-600 font-medium">
        {isConnecting ? "Connecting..." : isConnected ? "Tap to stop" : "Tap to start"}
      </p>

      {/* Instructions */}
      {!isConnected && !isConnecting && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 max-w-md w-full border-2 border-purple-200">
          <h3 className="font-bold text-purple-700 mb-3 text-center">How to Talk with Kai</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">1.</span>
              <span>Tap the green button to connect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">2.</span>
              <span>Wait for Kai to say hello</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">3.</span>
              <span>Just start talking - Kai will listen!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">4.</span>
              <span>Kai will respond when you pause</span>
            </li>
          </ul>
        </div>
      )}

      {/* Tips when connected */}
      {isConnected && (
        <div className="mt-6 bg-yellow-50 rounded-2xl p-4 max-w-md w-full border-2 border-yellow-200">
          <h3 className="font-bold text-yellow-700 mb-2">Tips:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>- Speak slowly and clearly</li>
            <li>- Wait for Kai to finish before speaking</li>
            <li>- Try saying "Hello Kai!" or "How are you?"</li>
            <li>- Tap the red button to end the conversation</li>
          </ul>
        </div>
      )}
    </div>
  );
}
