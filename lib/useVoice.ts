"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceReturn {
  // Text-to-Speech
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;

  // Speech-to-Text
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  resetTranscript: () => void;

  // Support & Error
  isSupported: boolean;
  error: string | null;
  clearError: () => void;
}

// Detect supported audio format for MediaRecorder
function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;

  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/wav",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

// Get file extension from mime type
function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export function useVoice(): UseVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MAX_RECORDING_TIME = 15000;

  // Check browser support on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasMediaDevices = !!(navigator.mediaDevices?.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== "undefined";
    const hasAudio = typeof Audio !== "undefined";

    setIsSupported(hasMediaDevices && hasMediaRecorder && hasAudio);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup audio URL
  const cleanupAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Text-to-Speech using OpenAI TTS API
  const speak = useCallback(async (text: string) => {
    if (!text.trim() || typeof window === "undefined") return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
    cleanupAudioUrl();

    abortControllerRef.current = new AbortController();
    setIsSpeaking(true);
    setError(null);

    try {
      console.log("[TTS] Requesting:", text.slice(0, 50));

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create fresh audio element for each play
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log("[TTS] Playback ended");
        setIsSpeaking(false);
        cleanupAudioUrl();
      };

      audio.onerror = (e) => {
        // Only log if it's a real error (not from cleanup)
        if (audio.src && audio.src !== "") {
          console.error("[TTS] Playback error:", e);
          setError("Audio playback failed");
        }
        setIsSpeaking(false);
        cleanupAudioUrl();
      };

      await audio.play();
      console.log("[TTS] Playing");

    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("[TTS] Aborted");
      } else {
        console.error("[TTS] Error:", err);
        setError("Could not play audio");
      }
      setIsSpeaking(false);
      cleanupAudioUrl();
    }
  }, [cleanupAudioUrl]);

  const stopSpeaking = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    cleanupAudioUrl();
    setIsSpeaking(false);
  }, [cleanupAudioUrl]);

  // Speech-to-Text using MediaRecorder + Whisper API
  const startListening = useCallback(async () => {
    if (typeof window === "undefined") return;

    console.log("[STT] Starting...");
    setError(null);
    setTranscript("");
    setIsProcessing(false);
    audioChunksRef.current = [];

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError("Audio recording not supported in this browser");
      return;
    }

    console.log("[STT] MimeType:", mimeType);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("[STT] Microphone access granted");
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[STT] Recording stopped, chunks:", audioChunksRef.current.length);

        // Cleanup stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (audioChunksRef.current.length === 0) {
          setIsListening(false);
          setError("No audio recorded");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("[STT] Blob size:", audioBlob.size);

        if (audioBlob.size < 1000) {
          setIsListening(false);
          setError("Recording too short");
          return;
        }

        // Start processing
        setIsListening(false);
        setIsProcessing(true);

        try {
          const formData = new FormData();
          const ext = getExtensionFromMimeType(mimeType);
          formData.append("audio", audioBlob, `recording.${ext}`);

          console.log("[STT] Sending to API...");
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
          }

          const data = await response.json();
          console.log("[STT] Result:", data.text);

          if (data.text?.trim()) {
            setTranscript(data.text.trim());
          } else {
            setError("Could not understand audio");
          }
        } catch (err) {
          console.error("[STT] Transcription error:", err);
          setError("Transcription failed");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.onerror = () => {
        setError("Recording error");
        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsListening(true);
      console.log("[STT] Recording started");

      // Auto-stop timeout
      timeoutRef.current = setTimeout(() => {
        console.log("[STT] Max time reached");
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_TIME);

    } catch (err) {
      console.error("[STT] Microphone error:", err);
      setIsListening(false);

      if (err instanceof DOMException) {
        const messages: Record<string, string> = {
          NotAllowedError: "Microphone permission denied",
          NotFoundError: "No microphone found",
          NotReadableError: "Microphone busy",
        };
        setError(messages[err.name] || "Microphone access failed");
      } else {
        setError("Could not access microphone");
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log("[STT] Stopping...");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
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
    isProcessing,
    transcript,
    resetTranscript,
    isSupported,
    error,
    clearError,
  };
}
