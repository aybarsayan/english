"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Mascot from "./Mascot";
import { useVoice } from "@/lib/useVoice";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<"happy" | "thinking" | "speaking" | "listening" | "celebrating">("happy");
  const [textInput, setTextInput] = useState("");
  const hasPlayedWelcome = useRef(false);
  const lastTranscriptRef = useRef("");

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    isProcessing,
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
    } else if (isProcessing || isLoading) {
      setMascotMood("thinking");
    } else if (isSpeaking) {
      setMascotMood("speaking");
    } else {
      setMascotMood("happy");
    }
  }, [isListening, isProcessing, isSpeaking, isLoading]);

  // Show welcome message on mount
  useEffect(() => {
    const welcomeMessage = "Hello friend! I am Kai! Tap the microphone and talk to me in English!";
    setMessages([{
      id: "welcome",
      text: welcomeMessage,
      isUser: false,
    }]);
  }, []);

  // Send message to chat API
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

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

      // Check for celebration
      const lower = botResponse.toLowerCase();
      if (lower.includes("excellent") || lower.includes("great job") || lower.includes("amazing")) {
        setMascotMood("celebrating");
        setTimeout(() => setMascotMood("speaking"), 1000);
      }

      // Speak response
      await speak(botResponse);

    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = "Oops! Something went wrong. Please try again!";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        isUser: false,
      }]);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [messages, resetTranscript, speak, isLoading]);

  // Handle transcript changes - send when we get a new transcript
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current && !isProcessing && !isListening) {
      lastTranscriptRef.current = transcript;
      sendMessage(transcript);
    }
  }, [transcript, isProcessing, isListening, sendMessage]);

  const handleMicClick = () => {
    // Play welcome audio on first interaction
    if (!hasPlayedWelcome.current && messages.length > 0) {
      hasPlayedWelcome.current = true;
      const welcomeMsg = messages.find(m => m.id === "welcome");
      if (welcomeMsg && !isSpeaking) {
        speak(welcomeMsg.text);
        return; // Don't start listening immediately, let welcome play
      }
    }

    clearError();

    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      stopListening();
    } else if (!isProcessing && !isLoading) {
      startListening();
    }
  };

  const handleMascotClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (messages.length > 0) {
      const lastBotMessage = [...messages].reverse().find((m) => !m.isUser);
      if (lastBotMessage) {
        speak(lastBotMessage.text);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isLoading) {
      sendMessage(textInput);
    }
  };

  const handleQuickPhrase = (phrase: string) => {
    if (!isLoading && !isListening) {
      sendMessage(phrase);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <Mascot mood="happy" size="medium" />
        <h2 className="text-xl font-bold text-red-500 mb-2 mt-4">
          Voice not supported
        </h2>
        <p className="text-gray-600">
          Please use Chrome or Safari browser for voice chat.
        </p>
      </div>
    );
  }

  const isWorking = isListening || isProcessing || isLoading;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      {/* Mascot */}
      <div className="mb-6">
        <Mascot mood={mascotMood} size="large" onClick={handleMascotClick} />
        <p className="text-center text-sm text-gray-500 mt-2">
          {isSpeaking ? "Speaking..." : "Tap me to repeat!"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4 mb-4 max-w-md w-full">
          <p className="text-red-700 text-center font-medium">{error}</p>
          <p className="text-red-600 text-center text-sm mt-2">
            You can also type in the box below!
          </p>
        </div>
      )}

      {/* Speech Bubble */}
      <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full mb-6 relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

        <div className="max-h-48 overflow-y-auto space-y-3">
          {messages.slice(-4).map((message) => (
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

          {isLoading && (
            <div className="bg-purple-100 text-purple-800 p-3 rounded-2xl mr-8">
              <p className="text-sm font-medium">Kai:</p>
              <p className="animate-pulse">Thinking...</p>
            </div>
          )}

          {(isListening || isProcessing) && (
            <div className="bg-green-100 text-green-800 p-3 rounded-2xl">
              <p className="text-sm font-medium">
                {isListening ? "Listening..." : "Processing..."}
              </p>
              {isListening && <p>{transcript || "Say something in English!"}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        disabled={isLoading || isProcessing}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 ${
          isListening
            ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
            : "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 hover:scale-105"
        } ${isLoading || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isListening ? (
            <rect x="6" y="6" width="12" height="12" strokeWidth={2} fill="white" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        </svg>
      </button>
      <p className="text-center mt-3 text-gray-600 font-medium">
        {isListening ? "Tap to stop" : isProcessing ? "Processing..." : "Tap to talk"}
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
            disabled={isWorking}
          />
          <button
            type="submit"
            disabled={isWorking || !textInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>

      {/* Quick Phrases */}
      <div className="mt-6 w-full max-w-md">
        <p className="text-center text-sm text-gray-500 mb-3">
          Or tap a phrase to practice:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Hello!", "How are you?", "What is your name?", "I like cats!", "Thank you!"].map((phrase) => (
            <button
              key={phrase}
              onClick={() => handleQuickPhrase(phrase)}
              disabled={isWorking}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow hover:shadow-md hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 rounded-2xl p-4 max-w-md w-full border-2 border-yellow-200">
        <h3 className="font-bold text-yellow-700 mb-2">Tips:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>- Speak slowly and clearly</li>
          <li>- Use simple words</li>
          <li>- Tap the mascot to hear again</li>
          <li>- You can also type if voice does not work!</li>
        </ul>
      </div>
    </div>
  );
}
