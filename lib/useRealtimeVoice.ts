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

  // Error
  error: string | null;
  clearError: () => void;
}


type RealtimeEvent = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function useRealtimeVoice(): UseRealtimeVoiceReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Cleanup function
  const cleanup = useCallback(() => {
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
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
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
    error,
    clearError,
  };
}
