/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { SpeechLanguageCode } from "../constants.ts";
import { cleanSentenceText, deduplicateTranscript } from "../utils/textCleaner.ts";

// Global tracker to ensure only one microphone is listening at any time
let activeSessionStopper: (() => void) | null = null;

// Augment window for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface UseSpeechRecognitionOptions {
  onCommit: (text: string) => void;
  language: SpeechLanguageCode;
}

export function useSpeechRecognition({
  onCommit,
  language,
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>("");
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isExplicitlyStoppedRef = useRef<boolean>(true);
  const committedBaseRef = useRef<string>(""); // snapshot of text before recording started
  const currentDictationRef = useRef<string>(""); // words accumulated during this session
  const restartTimerRef = useRef<any>(null);
  const lastProcessedIndexRef = useRef<number>(-1);

  // Check browser support on mount
  useEffect(() => {
    const SpeechClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) {
      setIsSupported(false);
    }
  }, []);

  // Handle tab visibility change (screen lock or background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening) {
        stopSession(true, "Tap the mic to continue");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (activeSessionStopper === stopSessionInternal) {
        activeSessionStopper = null;
      }
    };
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
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }
      }

      setIsListening(false);
      setInterimText("");
      triggerHaptic(40);

      if (statusNotice) {
        setFriendlyError(statusNotice);
      }

      if (keepCaptured) {
        // Keep whatever was spoken in this session
        const combined = currentDictationRef.current
          ? committedBaseRef.current
            ? `${committedBaseRef.current.trim()} ${currentDictationRef.current.trim()}`
            : currentDictationRef.current.trim()
          : committedBaseRef.current;
        const cleaned = cleanSentenceText(combined);
        onCommit(cleaned);
      } else {
        // Discard dictation, restore what was there before
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

  const startListening = useCallback(
    (initialValue: string) => {
      const SpeechClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechClass) {
        setIsSupported(false);
        return;
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
      lastProcessedIndexRef.current = -1;
      isExplicitlyStoppedRef.current = false;

      triggerHaptic(40);

      const createAndStartRecognition = () => {
        try {
          const recognition = new SpeechClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
            setFriendlyError(null);
          };

          recognition.onresult = (event: any) => {
            let sessionFinalTranscript = "";
            let currentInterim = "";

            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              const transcript = res[0]?.transcript || "";
              if (res.isFinal) {
                if (i > lastProcessedIndexRef.current) {
                  lastProcessedIndexRef.current = i;
                  sessionFinalTranscript = deduplicateTranscript(
                    sessionFinalTranscript,
                    transcript
                  );
                }
              } else {
                currentInterim += transcript;
              }
            }

            if (sessionFinalTranscript) {
              currentDictationRef.current = deduplicateTranscript(
                currentDictationRef.current,
                sessionFinalTranscript
              );
              const combinedSoFar = committedBaseRef.current
                ? `${committedBaseRef.current.trim()} ${currentDictationRef.current.trim()}`
                : currentDictationRef.current.trim();
              onCommit(cleanSentenceText(combinedSoFar));
            }

            setInterimText(currentInterim.trim());
          };

          recognition.onerror = (event: any) => {
            const error = event.error;
            if (error === "no-speech" || error === "aborted") {
              // Silently ignore thinking pauses and normal restarts
              return;
            }

            if (error === "not-allowed" || error === "service-not-allowed") {
              isExplicitlyStoppedRef.current = true;
              setIsListening(false);
              setFriendlyError(
                "We can't hear you yet. Please allow the microphone in your browser, or just type instead."
              );
              return;
            }

            if (error === "network") {
              setFriendlyError(
                "Connection dropped, your words so far are saved. Tap the mic to continue."
              );
              return;
            }

            // General gentle fallback
            setFriendlyError("Tap the mic to continue speaking.");
          };

          recognition.onend = () => {
            // Browsers often time out recognition after a few seconds of silence.
            // If the user did not click Done or Cancel, automatically restart after 150ms!
            if (!isExplicitlyStoppedRef.current) {
              restartTimerRef.current = setTimeout(() => {
                if (!isExplicitlyStoppedRef.current) {
                  createAndStartRecognition();
                }
              }, 150);
            } else {
              setIsListening(false);
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch {
          setIsListening(false);
        }
      };

      createAndStartRecognition();
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
