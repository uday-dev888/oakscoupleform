/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import { SpeechLanguageCode } from "../constants.ts";
import { cleanSentenceText, deduplicateTranscript } from "../utils/textCleaner.ts";

// Global tracker to ensure only one microphone is active at any time
let activeSessionStopper: (() => void) | null = null;

export interface UseSpeechRecognitionOptions {
  onCommit: (text: string) => void;
  language: SpeechLanguageCode;
}

// Inline fallback for the AudioWorklet processor in case file fetch fails
const WORKLET_PROCESSOR_CODE = `
class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.chunkSize = 1600; // 100ms at 16kHz
    this.buffer = new Int16Array(this.chunkSize);
    this.bufferIndex = 0;
    this.sourceOffset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;
    const channelData = input[0];
    const inRate = sampleRate;
    const outRate = this.targetSampleRate;
    const ratio = inRate / outRate;

    let inIndex = this.sourceOffset;
    while (inIndex < channelData.length) {
      const idx0 = Math.floor(inIndex);
      const idx1 = Math.min(idx0 + 1, channelData.length - 1);
      const frac = inIndex - idx0;
      const s0 = channelData[idx0];
      const s1 = channelData[idx1];
      const sample = s0 + frac * (s1 - s0);

      const clamped = Math.max(-1, Math.min(1, sample));
      const int16 = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7FFF);

      this.buffer[this.bufferIndex++] = int16;

      if (this.bufferIndex >= this.chunkSize) {
        const chunkToSend = new Int16Array(this.buffer);
        this.port.postMessage(chunkToSend.buffer, [chunkToSend.buffer]);
        this.bufferIndex = 0;
      }

      inIndex += ratio;
    }

    this.sourceOffset = inIndex - channelData.length;
    return true;
  }
}
registerProcessor("pcm-processor", PcmProcessor);
`;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function useSpeechRecognition({
  onCommit,
  language,
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>("");
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  // References for live session management
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const liveSessionRef = useRef<any>(null);

  const isExplicitlyStoppedRef = useRef<boolean>(true);
  const committedBaseRef = useRef<string>("");
  const currentDictationRef = useRef<string>("");

  // Check support on mount
  useEffect(() => {
    const hasMedia = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    const hasAudioCtx = typeof window !== "undefined" && (!!window.AudioContext || !!(window as any).webkitAudioContext);
    if (!hasMedia || !hasAudioCtx) {
      setIsSupported(false);
    }
  }, []);

  const triggerHaptic = useCallback((pattern = 40) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Haptics optional
    }
  }, []);

  const stopSessionInternal = useCallback(
    (keepCaptured: boolean, statusNotice?: string) => {
      isExplicitlyStoppedRef.current = true;

      // 1. Disconnect and stop AudioWorklet & AudioContext
      if (workletNodeRef.current) {
        try {
          workletNodeRef.current.port.onmessage = null;
          workletNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        workletNodeRef.current = null;
      }

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
        audioContextRef.current = null;
      }

      // 2. Stop single continuous MediaStream tracks
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
        mediaStreamRef.current = null;
      }

      // 3. Close Gemini Live session
      if (liveSessionRef.current) {
        try {
          liveSessionRef.current.close();
        } catch {
          // ignore
        }
        liveSessionRef.current = null;
      }

      setIsListening(false);
      setInterimText("");
      triggerHaptic(40);

      if (statusNotice) {
        setFriendlyError(statusNotice);
      }

      if (keepCaptured) {
        const combined = currentDictationRef.current
          ? committedBaseRef.current
            ? `${committedBaseRef.current.trim()} ${currentDictationRef.current.trim()}`
            : currentDictationRef.current.trim()
          : committedBaseRef.current;
        const cleaned = cleanSentenceText(combined);
        onCommit(cleaned);
      } else {
        onCommit(committedBaseRef.current);
      }

      if (activeSessionStopper === stopSessionInternal) {
        activeSessionStopper = null;
      }
    },
    [onCommit, triggerHaptic]
  );

  const stopSession = useCallback(
    (keepCaptured: boolean, statusNotice?: string) => {
      stopSessionInternal(keepCaptured, statusNotice);
    },
    [stopSessionInternal]
  );

  // Tab visibility change (screen lock or background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening) {
        stopSession(true, "Tap the mic to continue speaking");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isListening, stopSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSessionInternal(true);
    };
  }, [stopSessionInternal]);

  const startListening = useCallback(
    async (initialValue: string) => {
      // 1. Immediately blur any active input/textarea to dismiss Android keyboard
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Stop any other active mic session in the app
      if (activeSessionStopper && activeSessionStopper !== stopSessionInternal) {
        activeSessionStopper();
      }
      activeSessionStopper = () => stopSessionInternal(true);

      setFriendlyError(null);
      setInterimText("");
      committedBaseRef.current = initialValue || "";
      currentDictationRef.current = "";
      isExplicitlyStoppedRef.current = false;
      triggerHaptic(40);

      try {
        // 2. Request mic stream ONCE with recommended constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        // If stopped while prompting permission
        if (isExplicitlyStoppedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // 3. Fetch ephemeral token from serverless endpoint /api/live-token
        let ephemeralToken: string | null = null;
        try {
          const res = await fetch("/api/live-token");
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error || `HTTP ${res.status}`);
          }
          const json = await res.json();
          ephemeralToken = json.token;
        } catch (tokenErr: any) {
          console.error("Token fetch failed:", tokenErr);
          throw new Error("Unable to connect to live transcription service.");
        }

        if (!ephemeralToken) {
          throw new Error("No live token received.");
        }

        // 4. Initialize Web Audio Context & AudioWorklet
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        audioContextRef.current = audioCtx;

        // Ensure audio context is running (needed on mobile after user gesture)
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        try {
          await audioCtx.audioWorklet.addModule("/pcm-processor.js");
        } catch (loadErr) {
          // Fallback to inline blob URL if needed
          const blob = new Blob([WORKLET_PROCESSOR_CODE], { type: "application/javascript" });
          const blobUrl = URL.createObjectURL(blob);
          await audioCtx.audioWorklet.addModule(blobUrl);
          URL.revokeObjectURL(blobUrl);
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
        workletNodeRef.current = workletNode;

        source.connect(workletNode);

        // 5. Connect to Gemini Live API with ephemeral token
        const clientAi = new GoogleGenAI({
          apiKey: ephemeralToken,
          httpOptions: { apiVersion: "v1alpha" },
        });

        const langPrompt = language
          ? `The speaker is speaking in language code ${language}. `
          : "";

        const session = await clientAi.live.connect({
          model: "gemini-3.5-transcribe-live",
          config: {
            inputAudioTranscription: {},
            systemInstruction: `You are a silent, verbatim transcriber. Never reply or speak. ${langPrompt}Transcribe exactly what the speaker says, in the language they speak.`,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const sc = message.serverContent;
              if (!sc) return;

              // Interim in-progress transcription
              if (sc.interimInputTranscription?.text) {
                setInterimText(sc.interimInputTranscription.text);
              }

              // Finalized input transcription segment
              if (sc.inputTranscription?.text) {
                const chunk = sc.inputTranscription.text;
                currentDictationRef.current = deduplicateTranscript(
                  currentDictationRef.current,
                  chunk
                );
                const combined = committedBaseRef.current
                  ? `${committedBaseRef.current.trim()} ${currentDictationRef.current.trim()}`
                  : currentDictationRef.current.trim();
                onCommit(cleanSentenceText(combined));
                setInterimText("");
              }
            },
            onerror: (err: any) => {
              console.error("Live session error:", err);
              if (!isExplicitlyStoppedRef.current) {
                setFriendlyError("Live connection dropped. Tap mic to resume.");
              }
            },
            onclose: () => {
              if (!isExplicitlyStoppedRef.current) {
                setIsListening(false);
              }
            },
          },
        });

        liveSessionRef.current = session;
        setIsListening(true);
        setFriendlyError(null);

        // 6. Stream ~100ms 16kHz mono 16-bit PCM chunks in real time
        workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
          if (isExplicitlyStoppedRef.current || !liveSessionRef.current) return;
          try {
            const base64Audio = arrayBufferToBase64(event.data);
            liveSessionRef.current.sendRealtimeInput({
              audio: {
                data: base64Audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } catch (sendErr) {
            console.error("Error sending realtime audio chunk:", sendErr);
          }
        };
      } catch (err: any) {
        console.error("Failed to start voice listening:", err);
        stopSessionInternal(true);

        const errorMsg = err?.message || "";
        if (
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError" ||
          errorMsg.includes("denied")
        ) {
          setFriendlyError(
            "We can't hear you yet. Please allow microphone access in your browser, or type instead."
          );
        } else {
          setFriendlyError(
            "Microphone or live connection unavailable. Tap to retry, or type your answer."
          );
        }
      }
    },
    [language, onCommit, stopSessionInternal, triggerHaptic]
  );

  return {
    isSupported,
    isListening,
    interimText,
    friendlyError,
    startListening,
    stopSession,
  };
}
