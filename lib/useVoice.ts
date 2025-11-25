"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 10000; // 10 seconds max

  // Check browser support
  useEffect(() => {
    const hasSupport =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "MediaRecorder" in window &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia;
    setIsSupported(!!hasSupport);
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
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

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

  // Speech-to-Text using Whisper API
  const startListening = useCallback(async () => {
    console.log("[useVoice] startListening called - WHISPER VERSION");
    if (typeof window === "undefined") return;

    setError(null);
    setTranscript("");
    audioChunksRef.current = [];

    try {
      console.log("[useVoice] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[useVoice] Microphone access granted");
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      console.log("[useVoice] Using mimeType:", mimeType);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        console.log("[useVoice] ondataavailable, size:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[useVoice] onstop called, chunks:", audioChunksRef.current.length);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          console.log("[useVoice] No audio chunks, returning");
          setIsListening(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        console.log("[useVoice] Audio blob size:", audioBlob.size);

        // Send to Whisper API
        try {
          setTranscript("Processing...");

          const formData = new FormData();
          const extension = mediaRecorder.mimeType.includes("webm") ? "webm" : "mp4";
          formData.append("audio", audioBlob, `recording.${extension}`);

          console.log("[useVoice] Sending to /api/transcribe...");
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          console.log("[useVoice] Response status:", response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("[useVoice] API error:", errorText);
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          console.log("[useVoice] Transcription result:", data);
          setTranscript(data.text || "");
        } catch (err) {
          console.error("[useVoice] Transcription error:", err);
          setError("Could not understand audio. Please try again!");
          setTranscript("");
        }

        setIsListening(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      console.log("[useVoice] MediaRecorder started");
      setIsListening(true);

      // Auto-stop after MAX_RECORDING_TIME
      timeoutRef.current = setTimeout(() => {
        console.log("[useVoice] Max recording time reached, auto-stopping");
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_TIME);
    } catch (err) {
      console.error("[useVoice] Microphone error:", err);
      setIsListening(false);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Microphone permission required. Please allow microphone access!");
        } else if (err.name === "NotFoundError") {
          setError("Microphone not found. Please check your microphone!");
        } else {
          setError("Could not access microphone. Please try again!");
        }
      } else {
        setError("Could not start microphone. Please refresh and try again!");
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log("[useVoice] stopListening called");
    // Clear auto-stop timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      console.log("[useVoice] Stopping MediaRecorder...");
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
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
