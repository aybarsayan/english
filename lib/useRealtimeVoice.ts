"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  order: number;
}

interface PendingItem {
  id: string;
  isUser: boolean;
  order: number;
}

type ActionType =
  | "jump" | "dance" | "wave" | "clap" | "spin" | "bow"
  | "nod" | "shake-head" | "laugh" | "wink" | "high-five"
  | "hug" | "celebrating" | "fly" | "sleep" | "cry" | "yawn"
  | "sit" | "run" | "stretch" | "eat" | null;

const ACTION_DURATIONS: Record<string, number> = {
  "jump": 2000, "spin": 3000, "dance": 4000, "fly": 4000,
  "wave": 3000, "clap": 3000, "bow": 2000, "nod": 2000,
  "shake-head": 2000, "laugh": 3000, "wink": 2000,
  "high-five": 2000, "hug": 3000, "celebrating": 3000,
  "sit": 3000, "run": 3000, "stretch": 3000, "sleep": 4000,
  "yawn": 2000, "cry": 2000, "eat": 3000,
};

// Fallback for when the model says it is doing a movement ("I'm waving!") but
// forgets to call trigger_animation. Only first-person phrases count, so
// "Do you like to dance?" does not make Kai dance.
const SPOKEN_ACTION_PATTERNS: [RegExp, Exclude<ActionType, null>][] = [
  [/high[\s-]?fives?/, "high-five"],
  [/\bwav(e|es|ing)\b/, "wave"],
  [/\bjump(s|ing)?\b/, "jump"],
  [/\bdanc(e|es|ing)\b/, "dance"],
  [/\bclap(s|ping)?\b/, "clap"],
  [/\bspin(s|ning)?\b|\bturn(ing)? around\b/, "spin"],
  [/\bbow(s|ing)?\b/, "bow"],
  [/\bfly(ing)?\b/, "fly"],
  [/\bsit(ting)?( down)?\b/, "sit"],
  [/\brun(s|ning)?\b/, "run"],
  [/\bstretch(es|ing)?\b/, "stretch"],
  [/\bhug(s|ging)?\b/, "hug"],
  [/\bwink(s|ing)?\b/, "wink"],
  [/\bcelebrat(e|es|ing)\b/, "celebrating"],
];
const FIRST_PERSON = /\b(i am|i'm|i will|i'll|let me|watch me|look at me|here i go|i can)\b([^.!?]{0,25})/gi;

function matchAction(text: string): ActionType {
  for (const [pattern, action] of SPOKEN_ACTION_PATTERNS) {
    if (pattern.test(text)) return action;
  }
  return null;
}

function detectSpokenAction(transcript: string): ActionType {
  for (const match of transcript.matchAll(FIRST_PERSON)) {
    const action = matchAction(match[2].toLowerCase());
    if (action) return action;
  }
  // "High five!" on its own is always an action, not a topic
  if (/(^|[.!?]\s*)high[\s-]?five\b/i.test(transcript)) return "high-five";
  return null;
}

// The child's own command ("Kai, jump!", "Can you dance?", "zıpla!") plays the
// animation immediately, without waiting for the model.
const COMMAND_PREFIX = /^(kai|please|can you|could you|will you|let's|lets|let us|show me|give me|now|ok|okay|and|you)\b[\s,]*/;
const TURKISH_COMMANDS: [RegExp, Exclude<ActionType, null>][] = [
  [/zıpla/, "jump"],
  [/dans (et|eder)/, "dance"],
  [/el salla/, "wave"],
  [/alkış/, "clap"],
  [/(etrafında )?dön(sene|er misin)?$/, "spin"],
  [/eğil/, "bow"],
  [/(^|\s)otur/, "sit"],
  [/(^|\s)koş/, "run"],
  [/(^|\s)uç(sana|ar mısın)?$/, "fly"],
  [/(^|\s)uyu/, "sleep"],
  [/sarıl/, "hug"],
  [/göz kırp/, "wink"],
  [/beşlik|çak bir/, "high-five"],
];

function detectChildCommand(transcript: string): ActionType {
  const text = transcript.toLowerCase().trim();

  for (const segment of text.split(/[.!?,]+/)) {
    let s = segment.trim();
    let prev;
    do {
      prev = s;
      s = s.replace(COMMAND_PREFIX, "");
    } while (s !== prev);
    // English imperative: the sentence (after "Kai,", "can you", "please"...) starts with the verb
    const firstWords = s.split(/\s+/).slice(0, 3).join(" ");
    if (/^(a\s+)?(high[\s-]?five|wave|jump|dance|clap|spin|turn around|bow|fly|sit|run|stretch|hug|wink|celebrate)\b/.test(firstWords)) {
      const action = matchAction(firstWords);
      if (action) return action;
    }
  }

  // Turkish commands are verb-final ("Kai zıpla", "dans et"), so only short phrases count
  if (text.split(/\s+/).length <= 6) {
    for (const [pattern, action] of TURKISH_COMMANDS) {
      if (pattern.test(text)) return action;
    }
  }
  return null;
}

interface UseRealtimeVoiceOptions {
  maxSessionDuration?: number;
  onSessionEnd?: (duration: number, messages: Message[]) => void;
  shouldRecord?: boolean;
  onRecordingComplete?: (blob: Blob) => void;
}

interface UseRealtimeVoiceReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  messages: Message[];
  currentAction: ActionType;
  sessionDuration: number;
  maxSessionDuration: number;
  isMuted: boolean;
  toggleMute: () => void;
  error: string | null;
  clearError: () => void;
  isSupported: boolean;
  isRecording: boolean;
}

type RealtimeEvent = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

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

const MAX_SESSION_DURATION_DEFAULT = 300;

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}): UseRealtimeVoiceReturn {
  const {
    maxSessionDuration = MAX_SESSION_DURATION_DEFAULT,
    onSessionEnd,
    shouldRecord = false,
    onRecordingComplete,
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
  const [isRecording, setIsRecording] = useState(false);

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
  const messagesRef = useRef<Message[]>([]);
  const pendingItemsRef = useRef<Map<string, PendingItem>>(new Map());
  const orderCounterRef = useRef(0);

  // Recording refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const aiStreamRef = useRef<MediaStream | null>(null);
  const pendingRecordingRef = useRef(false);
  const shouldRecordRef = useRef(shouldRecord);
  const onRecordingCompleteRef = useRef(onRecordingComplete);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => { onSessionEndRef.current = onSessionEnd; }, [onSessionEnd]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { shouldRecordRef.current = shouldRecord; }, [shouldRecord]);
  useEffect(() => { onRecordingCompleteRef.current = onRecordingComplete; }, [onRecordingComplete]);

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

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Starts merging user mic + AI stream into a single MediaRecorder
  const startRecordingInternal = useCallback(() => {
    try {
      if (!mediaStreamRef.current || !aiStreamRef.current) {
        console.warn("[Recording] Streams not ready, skipping");
        return;
      }

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const dest = audioCtx.createMediaStreamDestination();

      const userSource = audioCtx.createMediaStreamSource(mediaStreamRef.current);
      userSource.connect(dest);

      const aiSource = audioCtx.createMediaStreamSource(aiStreamRef.current);
      aiSource.connect(dest);

      recordedChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(dest.stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || "audio/webm" });
        onRecordingCompleteRef.current?.(blob);
        recordedChunksRef.current = [];
        setIsRecording(false);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      console.log("[Recording] Started");
    } catch (err) {
      console.error("[Recording] Failed to start:", err);
    }
  }, []);

  const cleanup = useCallback(() => {
    // Stop recording and hand back the blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // onstop fires asynchronously, so state update happens there
    }
    mediaRecorderRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    aiStreamRef.current = null;
    pendingRecordingRef.current = false;

    // Session duration callback
    if (sessionStartTimeRef.current) {
      const finalDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      if (onSessionEndRef.current && finalDuration > 0) {
        onSessionEndRef.current(finalDuration, messagesRef.current);
      }
      sessionStartTimeRef.current = null;
    }

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

    pendingItemsRef.current.clear();
    orderCounterRef.current = 0;
  }, []);

  const addMessageSorted = useCallback((newMsg: Message) => {
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      updated.sort((a, b) => a.order - b.order);
      return updated;
    });
  }, []);

  const playAction = useCallback((animation: ActionType) => {
    if (!animation) return;
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    setCurrentAction(animation);
    const duration = ACTION_DURATIONS[animation] || 3000;
    actionTimeoutRef.current = setTimeout(() => setCurrentAction(null), duration);
  }, []);

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log("[Realtime] Event:", event.type);

    switch (event.type) {
      case "input_audio_buffer.speech_started":
        setIsUserSpeaking(true);
        break;

      case "input_audio_buffer.speech_stopped":
        setIsUserSpeaking(false);
        break;

      // WebRTC playback events (the old "response.audio.started" never existed)
      case "output_audio_buffer.started":
        setIsAISpeaking(true);
        break;

      case "output_audio_buffer.stopped":
      case "output_audio_buffer.cleared":
        setIsAISpeaking(false);
        break;

      case "conversation.item.added":
      case "conversation.item.created": {
        const item = event.item;
        if (item && item.id && !pendingItemsRef.current.has(item.id)) {
          const isUser = item.role === "user";
          const order = orderCounterRef.current++;
          pendingItemsRef.current.set(item.id, { id: item.id, isUser, order });
          console.log("[Realtime] Item created:", item.id, "order:", order, "isUser:", isUser);
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        if (event.transcript) {
          const itemId = event.item_id || Date.now().toString();
          const pending = pendingItemsRef.current.get(itemId);
          const order = pending?.order ?? orderCounterRef.current++;
          addMessageSorted({ id: itemId, text: event.transcript, isUser: true, order });
          pendingItemsRef.current.delete(itemId);

          const command = detectChildCommand(event.transcript);
          if (command) {
            console.log("[Realtime] Animation from child's command:", command);
            playAction(command);
          }
        }
        break;
      }

      case "response.output_audio_transcript.done": {
        if (event.transcript) {
          const itemId = event.item_id || Date.now().toString();
          const pending = pendingItemsRef.current.get(itemId);
          const order = pending?.order ?? orderCounterRef.current++;
          addMessageSorted({ id: itemId, text: event.transcript, isUser: false, order });
          pendingItemsRef.current.delete(itemId);
        }
        break;
      }

      // Play the animation as soon as the tool call is complete
      case "response.output_item.done":
        if (event.item?.type === "function_call" && event.item?.name === "trigger_animation") {
          try {
            const args = JSON.parse(event.item.arguments || "{}");
            console.log("[Realtime] Animation triggered:", args.animation);
            playAction(args.animation as ActionType);
          } catch (err) {
            console.error("[Realtime] Failed to parse function call:", err);
          }
        }
        break;

      // Once the whole response is finished, answer tool calls and apply the fallback
      case "response.done": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output: any[] = event.response?.output || [];
        const calls = output.filter((o) => o.type === "function_call" && o.name === "trigger_animation");
        const spoke = output.some((o) => o.type === "message");

        if (calls.length > 0) {
          const dc = dataChannelRef.current;
          if (dc?.readyState === "open") {
            for (const call of calls) {
              dc.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: call.call_id,
                  output: JSON.stringify({ success: true }),
                },
              }));
            }
            // Only ask for a follow-up if Kai has not spoken yet in this response,
            // otherwise Kai would talk twice.
            if (!spoke) {
              dc.send(JSON.stringify({ type: "response.create" }));
            }
          }
        } else if (spoke) {
          const transcript = output
            .filter((o) => o.type === "message")
            .flatMap((o) => o.content || [])
            .map((c: { transcript?: string; text?: string }) => c.transcript || c.text || "")
            .join(" ");
          const spokenAction = detectSpokenAction(transcript);
          if (spokenAction) {
            console.log("[Realtime] Fallback animation from speech:", spokenAction);
            playAction(spokenAction);
          }
        }
        break;
      }

      case "error":
        console.error("[Realtime] Error:", event.error);
        setError(event.error?.message || "Connection error");
        break;
    }
  }, [addMessageSorted, playAction]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    const support = checkBrowserSupport();
    if (!support.supported) {
      setError(support.reason || "Browser not supported");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log("[Realtime] Getting session token...");
      const sessionResponse = await fetch("/api/realtime/session", { method: "POST" });
      if (!sessionResponse.ok) throw new Error("Failed to get session token");

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret?.value;
      if (!ephemeralKey) throw new Error("No ephemeral key received");

      console.log("[Realtime] Got ephemeral key");

      console.log("[Realtime] Requesting microphone...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = mediaStream;
      console.log("[Realtime] Microphone access granted");

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        console.log("[Realtime] Received audio track");
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        audioElementRef.current = audio;

        // Save AI stream for recording
        aiStreamRef.current = event.streams[0];

        // If onopen already fired and was waiting for the AI stream, start now
        if (pendingRecordingRef.current) {
          pendingRecordingRef.current = false;
          startRecordingInternal();
        }
      };

      mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

      const dataChannel = pc.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("[Realtime] Data channel open");
        setIsConnected(true);
        setIsConnecting(false);
        sessionStartTimeRef.current = Date.now();
        setSessionDuration(0);

        // Start recording if requested
        if (shouldRecordRef.current) {
          if (aiStreamRef.current) {
            startRecordingInternal();
          } else {
            // AI track hasn't arrived yet — ontrack will start recording when it does
            pendingRecordingRef.current = true;
          }
        }

        playAction("wave");

        dataChannel.send(JSON.stringify({
          type: "response.create",
          response: {
            output_modalities: ["audio"],
            instructions: "Greet the child warmly and introduce yourself as Kai. Keep it very short, just 1 sentence.",
          },
        }));
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

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("[Realtime] Connecting to OpenAI...");
      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) throw new Error("Failed to establish WebRTC connection");

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      console.log("[Realtime] WebRTC connection established");
    } catch (err) {
      console.error("[Realtime] Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      cleanup();
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, handleRealtimeEvent, cleanup, startRecordingInternal, playAction]);

  const disconnect = useCallback(() => {
    console.log("[Realtime] Disconnecting...");
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
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
    isRecording,
  };
}
