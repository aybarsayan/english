"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

type ActionType =
  | "jump" | "dance" | "wave" | "clap" | "spin" | "bow"
  | "nod" | "shake-head" | "laugh" | "wink" | "high-five"
  | "hug" | "celebrating" | "fly" | "sleep" | "cry" | "yawn" | null;

interface UseRealtimeVoiceOptions {
  maxSessionDuration?: number; // saniye cinsinden (varsayılan 600 = 10 dakika)
  onSessionEnd?: (duration: number) => void; // oturum bittiğinde çağrılır
}

interface UseRealtimeVoiceReturn {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;

  // State
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  messages: Message[];
  currentAction: ActionType;

  // Session Duration
  sessionDuration: number; // saniye cinsinden mevcut oturum süresi
  maxSessionDuration: number;

  // Microphone
  isMuted: boolean;
  toggleMute: () => void;

  // Error & Support
  error: string | null;
  clearError: () => void;
  isSupported: boolean;
}


type RealtimeEvent = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Check browser compatibility
function checkBrowserSupport(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Server-side rendering" };
  }

  if (typeof RTCPeerConnection === "undefined") {
    return { supported: false, reason: "Your browser doesn't support voice calls. Please use Chrome or Safari." };
  }

  if (!navigator?.mediaDevices?.getUserMedia) {
    return { supported: false, reason: "Your browser doesn't support microphone access. Please use Chrome or Safari." };
  }

  return { supported: true };
}

const MAX_SESSION_DURATION_DEFAULT = 300; // 5 dakika

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}): UseRealtimeVoiceReturn {
  const {
    maxSessionDuration = MAX_SESSION_DURATION_DEFAULT,
    onSessionEnd
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Check browser support on mount
  useEffect(() => {
    const support = checkBrowserSupport();
    setIsSupported(support.supported);
    if (!support.supported && support.reason) {
      setError(support.reason);
    }
  }, []);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const onSessionEndRef = useRef(onSessionEnd);

  const clearError = useCallback(() => setError(null), []);

  // Keep onSessionEnd ref updated
  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  // Session timer - her saniye güncelle
  useEffect(() => {
    if (isConnected && sessionStartTimeRef.current) {
      sessionTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current!) / 1000);
        setSessionDuration(elapsed);
      }, 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
          sessionTimerRef.current = null;
        }
      };
    }
  }, [isConnected]);

  // Toggle microphone mute
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Session süresini hesapla ve callback'i çağır
    if (sessionStartTimeRef.current) {
      const finalDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      if (onSessionEndRef.current && finalDuration > 0) {
        onSessionEndRef.current(finalDuration);
      }
      sessionStartTimeRef.current = null;
    }

    // Session timer'ı temizle
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setIsConnected(false);
    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setSessionDuration(0);
  }, []);

  // Handle incoming events from OpenAI
  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log("[Realtime] Event:", event.type);

    switch (event.type) {
      case "input_audio_buffer.speech_started":
        setIsUserSpeaking(true);
        break;

      case "input_audio_buffer.speech_stopped":
        setIsUserSpeaking(false);
        break;

      case "response.audio.started":
        setIsAISpeaking(true);
        break;

      case "response.audio.done":
        setIsAISpeaking(false);
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User's speech transcript
        if (event.transcript) {
          setMessages((prev) => [
            ...prev,
            {
              id: event.item_id || Date.now().toString(),
              text: event.transcript,
              isUser: true,
            },
          ]);
        }
        break;

      case "response.audio_transcript.done":
        // AI's response transcript
        if (event.transcript) {
          setMessages((prev) => [
            ...prev,
            {
              id: event.item_id || Date.now().toString(),
              text: event.transcript,
              isUser: false,
            },
          ]);
        }
        break;

      case "response.output_item.done":
        // Function call completed
        if (event.item?.type === "function_call" && event.item?.name === "trigger_animation") {
          try {
            const args = JSON.parse(event.item.arguments || "{}");
            const animation = args.animation as ActionType;

            if (animation) {
              console.log("[Realtime] Animation triggered:", animation);

              if (actionTimeoutRef.current) {
                clearTimeout(actionTimeoutRef.current);
              }
              setCurrentAction(animation);

              // Clear action after animation duration
              const durations: Record<string, number> = {
                "jump": 2000, "spin": 3000, "dance": 4000, "fly": 4000,
                "wave": 3000, "clap": 3000, "bow": 2000, "nod": 2000,
                "shake-head": 2000, "laugh": 3000, "wink": 2000,
                "high-five": 2000, "hug": 3000, "celebrating": 3000,
              };
              const duration = durations[animation] || 3000;

              actionTimeoutRef.current = setTimeout(() => {
                setCurrentAction(null);
              }, duration);

              // Send function result back and continue response
              if (dataChannelRef.current?.readyState === "open") {
                // 1. Acknowledge the function call
                dataChannelRef.current.send(JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: event.item.call_id,
                    output: JSON.stringify({ success: true, animation })
                  }
                }));

                // 2. Tell AI to continue speaking
                dataChannelRef.current.send(JSON.stringify({
                  type: "response.create"
                }));
              }
            }
          } catch (err) {
            console.error("[Realtime] Failed to parse function call:", err);
          }
        }
        break;

      case "error":
        console.error("[Realtime] Error:", event.error);
        setError(event.error?.message || "Connection error");
        break;
    }
  }, []);

  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    // Check browser support before connecting
    const support = checkBrowserSupport();
    if (!support.supported) {
      setError(support.reason || "Browser not supported");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 1. Get ephemeral key from our server
      console.log("[Realtime] Getting session token...");
      const sessionResponse = await fetch("/api/realtime/session", {
        method: "POST",
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to get session token");
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret?.value;

      if (!ephemeralKey) {
        throw new Error("No ephemeral key received");
      }

      console.log("[Realtime] Got ephemeral key");

      // 2. Get microphone access
      console.log("[Realtime] Requesting microphone...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = mediaStream;
      console.log("[Realtime] Microphone access granted");

      // 3. Create WebRTC peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // 4. Handle incoming audio from AI
      pc.ontrack = (event) => {
        console.log("[Realtime] Received audio track");
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        audioElementRef.current = audio;
      };

      // 5. Add microphone track
      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream);
      });

      // 6. Create data channel for events
      const dataChannel = pc.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("[Realtime] Data channel open");
        setIsConnected(true);
        setIsConnecting(false);
        sessionStartTimeRef.current = Date.now();
        setSessionDuration(0);

        // Send initial greeting request
        const greetingEvent = {
          type: "response.create",
          response: {
            modalities: ["audio", "text"],
            instructions: "Greet the user warmly and introduce yourself as Kai. Keep it very short, just 1 sentence.",
          },
        };
        dataChannel.send(JSON.stringify(greetingEvent));
      };

      dataChannel.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch (err) {
          console.error("[Realtime] Failed to parse event:", err);
        }
      };

      dataChannel.onerror = (e) => {
        console.error("[Realtime] Data channel error:", e);
        setError("Connection error");
      };

      dataChannel.onclose = () => {
        console.log("[Realtime] Data channel closed");
        cleanup();
      };

      // 7. Create and set local SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 8. Send offer to OpenAI and get answer
      console.log("[Realtime] Connecting to OpenAI...");
      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error("Failed to establish WebRTC connection");
      }

      const answerSdp = await sdpResponse.text();

      // 9. Set remote description
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      console.log("[Realtime] WebRTC connection established");
    } catch (err) {
      console.error("[Realtime] Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      cleanup();
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, handleRealtimeEvent, cleanup]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log("[Realtime] Disconnecting...");
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
    };
  }, [cleanup]);

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isUserSpeaking,
    isAISpeaking,
    messages,
    currentAction,
    sessionDuration,
    maxSessionDuration,
    isMuted,
    toggleMute,
    error,
    clearError,
    isSupported,
  };
}
