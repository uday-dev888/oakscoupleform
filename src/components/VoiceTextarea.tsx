/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useId } from "react";
import { Mic, X, Check, Globe } from "lucide-react";
import { SPEECH_LANGUAGES, SpeechLanguageCode } from "../constants.ts";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.ts";

interface VoiceTextareaProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isVoiceEnabled?: boolean;
  onEnterPress?: () => void;
  singleLine?: boolean;
}

export const VoiceTextarea: React.FC<VoiceTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Type your thoughts here...",
  rows = 4,
  isVoiceEnabled = true,
  onEnterPress,
  singleLine = false,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Stored language selection
  const [language, setLanguage] = useState<SpeechLanguageCode>(() => {
    try {
      const saved = localStorage.getItem("our_story_speech_lang");
      if (
        saved &&
        SPEECH_LANGUAGES.some((l) => l.code === (saved as SpeechLanguageCode))
      ) {
        return saved as SpeechLanguageCode;
      }
    } catch {
      // ignore
    }
    return "en-IN";
  });

  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleLanguageChange = (newLang: SpeechLanguageCode) => {
    setLanguage(newLang);
    setShowLangMenu(false);
    try {
      localStorage.setItem("our_story_speech_lang", newLang);
    } catch {
      // ignore
    }
  };

  const {
    isSupported,
    isListening,
    interimText,
    friendlyError,
    startListening,
    stopSession,
    updateBaseText,
  } = useSpeechRecognition({
    language,
    onCommit: (newText) => {
      onChange(newText);
      // Place cursor at end after commit
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.selectionStart = len;
          textareaRef.current.selectionEnd = len;
        }
      }, 50);
    },
  });

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current && !singleLine) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.max(
        rows * 32,
        Math.min(textareaRef.current.scrollHeight, 400)
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, interimText, rows, singleLine]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (singleLine && e.key === "Enter") {
      e.preventDefault();
      onEnterPress?.();
    }
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isListening) {
      startListening(value ?? "");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSession(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSession(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.selectionStart = len;
        textareaRef.current.selectionEnd = len;
      }
    }, 50);
  };

  const activeLangLabel =
    SPEECH_LANGUAGES.find((l) => l.code === language)?.label || "English (India)";

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-base sm:text-lg font-medium text-[#1A1A1A] cursor-pointer"
          onClick={() => textareaRef.current?.focus()}
        >
          {label}
        </label>
      )}

      {/* Main Textarea Container */}
      <div
        onClick={() => {
          textareaRef.current?.focus();
        }}
        className={`relative w-full rounded-2xl border transition-all duration-200 bg-white cursor-text ${
          isListening
            ? "border-[#B08D57] ring-4 ring-[#B08D57]/20 shadow-lg"
            : "border-[#E8E8E8] hover:border-[#1A1A1A]/40 focus-within:border-[#1A1A1A] focus-within:ring-2 focus-within:ring-[#1A1A1A]/10 shadow-xs"
        }`}
      >
        <textarea
          ref={textareaRef}
          id={inputId}
          name={inputId}
          rows={singleLine ? 1 : rows}
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            updateBaseText(val);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label || placeholder}
          autoComplete="off"
          className="w-full px-5 py-4 text-[18px] leading-relaxed text-[#1A1A1A] placeholder:text-[#5F5F5F]/60 bg-transparent resize-none focus:outline-hidden rounded-2xl min-h-[58px]"
        />

        {/* Live interim transcript display overlay when listening */}
        {isListening && interimText && (
          <div className="px-5 pb-3 text-[18px] text-[#5F5F5F]/80 italic">
            <span>{interimText}</span>
          </div>
        )}

        {/* Listening Waveform & Controls Bar */}
        {isVoiceEnabled && isSupported && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-t border-[#E8E8E8]/60 bg-[#FAFAFA]/70 rounded-b-2xl gap-2 overflow-hidden">
            {/* Language Selector Chip */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLangMenu(!showLangMenu);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm text-[#5F5F5F] hover:text-[#1A1A1A] hover:bg-white border border-transparent hover:border-[#E8E8E8] transition-colors shrink-0"
                aria-label="Select speech language"
                aria-expanded={showLangMenu}
              >
                <Globe className="w-3.5 h-3.5 text-[#5F5F5F] shrink-0" />
                <span className={isListening ? "hidden sm:inline" : "inline"}>
                  {activeLangLabel}
                </span>
              </button>

              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangMenu(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-1 z-50 w-48 bg-white border border-[#E8E8E8] rounded-xl shadow-lg py-1">
                    {SPEECH_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center justify-between ${
                          language === lang.code
                            ? "bg-[#FAFAFA] font-semibold text-[#1A1A1A]"
                            : "text-[#5F5F5F] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
                        }`}
                      >
                        {lang.label}
                        {language === lang.code && (
                          <Check className="w-4 h-4 text-[#B08D57]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Listening Waveform Animation & State */}
            {isListening ? (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-white border border-[#B08D57]/40 rounded-full shadow-2xs shrink-0">
                  <div className="w-1.5 h-3 bg-[#B08D57] rounded-full animate-wave-1" />
                  <div className="w-1.5 h-5 bg-[#B08D57] rounded-full animate-wave-2" />
                  <div className="w-1.5 h-4 bg-[#B08D57] rounded-full animate-wave-3" />
                  <div className="w-1.5 h-6 bg-[#B08D57] rounded-full animate-wave-4" />
                  <div className="w-1.5 h-2 bg-[#B08D57] rounded-full animate-wave-5" />
                  <span className="ml-1.5 text-xs font-medium text-[#1A1A1A] hidden sm:inline">
                    Listening...
                  </span>
                </div>

                {/* Two large round buttons: X (cancel) and Check (done) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white border border-[#E8E8E8] text-[#5F5F5F] hover:text-[#1A1A1A] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                    aria-label="Cancel speech dictation"
                    title="Cancel and revert"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDone}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#1A1A1A] text-white hover:bg-[#333333] active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                    aria-label="Finish speech dictation"
                    title="Done speaking"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Mic Button */
              <button
                type="button"
                onClick={handleMicClick}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAFAFA] active:bg-[#E8E8E8] border border-[#E8E8E8] text-sm font-medium text-[#1A1A1A] transition-all shadow-2xs hover:shadow-xs min-h-[38px] cursor-pointer"
                aria-label="Tap to speak into this field"
                title="Speak to dictate"
              >
                <Mic className="w-4 h-4 text-[#B08D57]" />
                <span className="text-xs sm:text-sm">Tap to speak</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Friendly Error or Status Notice */}
      {friendlyError && (
        <div
          role="status"
          className="text-sm px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-[#5F5F5F]"
        >
          {friendlyError}
        </div>
      )}

      {/* Unsupported browser fallback tip */}
      {isVoiceEnabled && !isSupported && (
        <div className="text-xs text-[#5F5F5F] px-1">
          Tip: tap the microphone on your mobile keyboard to speak your answer, or type your answer above.
        </div>
      )}
    </div>
  );
};
