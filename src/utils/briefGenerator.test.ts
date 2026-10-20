/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "node:test";
import assert from "node:assert/strict";
import { cleanSentenceText, deduplicateTranscript } from "./textCleaner.ts";
import { generateBriefSummary } from "./briefGenerator.ts";
import type { QuestionnaireAnswers } from "../types/questionnaire.ts";

test("cleanSentenceText capitalizes sentence starts and normalizes spaces", () => {
  const input = "we met at coffee. it was raining! did you know? yes.";
  const expected = "We met at coffee. It was raining! Did you know? Yes.";
  assert.equal(cleanSentenceText(input), expected);
});

test("cleanSentenceText handles empty or whitespace-only strings gracefully", () => {
  assert.equal(cleanSentenceText(""), "");
  assert.equal(cleanSentenceText("   "), "");
});

test("deduplicateTranscript avoids appending identical duplicate chunks", () => {
  const existing = "We love to travel together";
  const duplicateChunk = "travel together";
  const result = deduplicateTranscript(existing, duplicateChunk);
  assert.equal(result, "We love to travel together");
});

test("deduplicateTranscript appends new distinct chunk with space", () => {
  const existing = "We love to travel";
  const newChunk = "especially to Japan";
  const result = deduplicateTranscript(existing, newChunk);
  assert.equal(result, "We love to travel especially to Japan");
});

test("generateBriefSummary formats all 5 chapters and One Last Thing with couple names", () => {
  const mockAnswers: QuestionnaireAnswers = {
    partner1: "Aarav",
    partner2: "Meera",
    q1_calls: { aCallsB: "Meer", bCallsA: "Aaru" },
    q2_workPassion: { partnerA: "Architect", partnerB: "Curator" },
    q3_firstMeet: "Library cafe in Bangalore",
    q4_firstImpression: { partnerA: "Thoughtful smile", partnerB: "Sharp style" },
    q5_threeWords: ["Warm", "Adventurous", "Steady"],
    q6_activities: { selected: ["Travelling", "Food and cafes"], other: "Pottery" },
    q7_loveMost: { partnerA: "Her empathy", partnerB: "His humor" },
    q8_funnyStory: "Got lost on a scooter in Goa",
    q9_proposal: { choice: "story", story: "Sunset cliffside in Udaipur" },
    q10_people: {
      familyMembers: [
        {
          id: "1",
          name: "Sunita",
          relationship: "Mother",
          side: "sideA",
          mustCapture: true,
        },
      ],
      treeNotes: "Close-knit extended family",
    },
    q11_filmFeel: "Natural and candid",
    q12_references: {
      links: ["https://pinterest.com/pin/123"],
      images: [],
      notes: "Love grain and warm natural light",
    },
    q13_tone: "Romantic & Intimate",
    q14_moments: {
      selected: ["First look or first glance", "Quiet moments together"],
      other: "",
    },
    q15_captureAvoid: {
      definitelyCapture: "Grandparents dancing",
      pleaseAvoid: "Awkward stiff line-up photos",
    },
    q16_nonNegotiables: "Keep audio of our vows crystal clear",
    q17_emotional: "Aarav",
    q18_cameraVersatility: "Pretty comfortable",
    q19_whatMattersMost: {
      selected: ["Storytelling and film quality", "Personality and how comfortable we feel"],
      other: "",
    },
    q20_guidanceComfort: "Happy with gentle guidance",
    q21_comfortTips: {
      selected: ["A moment alone as a couple"],
      notes: "A quick breath before portraits",
    },
    q22_futureFeeling: "Warm nostalgia and happy tears",
    q23_oneLastThing: {
      notes: "Our dog Bruno might wear a bow-tie!",
      images: [],
    },
  };

  const brief = generateBriefSummary("Velvet & Vine Studios", mockAnswers);

  assert.ok(brief.includes("VELVET & VINE STUDIOS"));
  assert.ok(brief.includes("Aarav & Meera"));
  assert.ok(brief.includes("CHAPTER 1: YOUR STORY"));
  assert.ok(brief.includes("CHAPTER 2: YOUR PEOPLE"));
  assert.ok(brief.includes("CHAPTER 3: THE LOOK AND FEEL"));
  assert.ok(brief.includes("CHAPTER 4: YOUR DAY"));
  assert.ok(brief.includes("CHAPTER 5: WORKING TOGETHER"));
  assert.ok(brief.includes("ONE LAST THING"));
  assert.ok(brief.includes("Sunita (Mother) — [MUST CAPTURE]"));
  assert.ok(brief.includes("Natural and candid"));
  assert.ok(brief.includes("Bruno might wear a bow-tie"));
});
