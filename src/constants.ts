/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// STUDIO CONFIGURATION CONSTANTS (Easily change these for any wedding studio)
// ============================================================================
export const STUDIO_NAME = "OAKS Wedding";
export const STUDIO_LOGO_URL =
  "https://res.cloudinary.com/pcodbmuo/image/upload/v1792483927/Black_OAKS_uctgsb.webp";
export const SUBMIT_ENDPOINT = "";
export const ACCENT_COLOR = "#B08D57";

// Local storage key for persistent auto-saving
export const STORAGE_KEY = "our_story_questionnaire_v1";

// Supported speech-to-text languages
export const SPEECH_LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "hi-IN", label: "Hindi" },
  { code: "en-US", label: "English (US)" },
] as const;

export type SpeechLanguageCode = (typeof SPEECH_LANGUAGES)[number]["code"];
