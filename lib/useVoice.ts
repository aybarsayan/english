"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface UseVoiceReturn {
  // Text-to-Speech
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;

  // Speech-to-Text
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  resetTranscript: () => void;

  // Support & Error
  isSupported: boolean;
  error: string | null;
  clearError: () => void;
}

export function useVoice(): UseVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    const hasSupport =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(hasSupport);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Text-to-Speech
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Slightly slower for kids
    utterance.pitch = 1.1; // Slightly higher pitch for friendly sound

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Female") || voice.name.includes("Samantha") || voice.name.includes("Karen"))
    ) || voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Speech-to-Text
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    setError(null);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);

      // User-friendly error messages
      const errorMessages: Record<string, string> = {
        "network": "Internet connection required. Please check your connection!",
        "not-allowed": "Microphone permission required. Please allow microphone access!",
        "no-speech": "I could not hear you. Please try again!",
        "audio-capture": "Microphone not found. Please check your microphone!",
        "aborted": "", // User cancelled, no error needed
      };

      const message = errorMessages[event.error] || `An error occurred: ${event.error}`;
      if (message) {
        setError(message);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start recognition:", e);
      setError("Could not start microphone. Please refresh the page and try again!");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
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
  };
}
