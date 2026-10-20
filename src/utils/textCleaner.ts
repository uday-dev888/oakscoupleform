/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Capitalizes the first letter of each sentence and cleans extra spaces.
 * Does not rewrite or change words.
 */
export function cleanSentenceText(text: string): string {
  if (!text) return "";

  // Replace multiple whitespace/tabs with single space (while keeping linebreaks)
  const normalized = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  // Capitalize sentence starts (. ! ? followed by space or newline)
  return normalized.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
}

/**
 * Deduplicates repeated speech fragments (common bug in mobile Chrome Web Speech API).
 */
export function deduplicateTranscript(
  existingText: string,
  newFinalChunk: string
): string {
  const trimmedExisting = existingText.trim();
  const trimmedNew = newFinalChunk.trim();

  if (!trimmedNew) return existingText;
  if (!trimmedExisting) return trimmedNew;

  // If the existing text already ends with this exact chunk, avoid duplicating
  if (trimmedExisting.endsWith(trimmedNew)) {
    return existingText;
  }

  // Check overlap of trailing words
  const existingWords = trimmedExisting.split(/\s+/);
  const newWords = trimmedNew.split(/\s+/);

  let maxOverlap = 0;
  const maxCheck = Math.min(existingWords.length, newWords.length);

  for (let len = 1; len <= maxCheck; len++) {
    const endSlice = existingWords.slice(-len).join(" ").toLowerCase();
    const startSlice = newWords.slice(0, len).join(" ").toLowerCase();
    if (endSlice === startSlice) {
      maxOverlap = len;
    }
  }

  if (maxOverlap > 0) {
    const nonOverlappingNew = newWords.slice(maxOverlap).join(" ");
    return nonOverlappingNew
      ? `${trimmedExisting} ${nonOverlappingNew}`
      : trimmedExisting;
  }

  return `${trimmedExisting} ${trimmedNew}`;
}
