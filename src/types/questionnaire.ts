/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  side: "sideA" | "sideB" | "both";
  mustCapture: boolean;
  photoUrl?: string;
}

export interface QuestionnaireAnswers {
  partner1: string;
  partner2: string;
  q1_calls: { aCallsB: string; bCallsA: string };
  q2_workPassion: { partnerA: string; partnerB: string };
  q3_firstMeet: string;
  q4_firstImpression: { partnerA: string; partnerB: string };
  q5_threeWords: [string, string, string];
  q6_activities: { selected: string[]; other: string };
  q7_loveMost: { partnerA: string; partnerB: string };
  q8_funnyStory: string;
  q9_proposal: { choice: "story" | "na" | ""; story: string };
  q10_people: {
    familyMembers: FamilyMember[];
    treePhotoUrl?: string;
    treeNotes: string;
  };
  q11_filmFeel: string;
  q12_references: {
    links: string[];
    images: string[];
    notes: string;
  };
  q13_tone: string;
  q14_moments: { selected: string[]; other: string };
  q15_captureAvoid: { definitelyCapture: string; pleaseAvoid: string };
  q16_nonNegotiables: string;
  q17_emotional: string;
  q18_cameraVersatility: string;
  q19_whatMattersMost: { selected: string[]; other: string };
  q20_guidanceComfort: string;
  q21_comfortTips: { selected: string[]; notes: string };
  q22_futureFeeling: string;
  q23_oneLastThing: { notes: string; images: string[] };
}

export interface QuestionMeta {
  number: number;
  chapter: number;
  chapterTitle: string;
  title: string;
  helperText: string;
  isVoiceEnabled?: boolean;
}

export interface ChapterMeta {
  chapter: number;
  title: string;
  subtitle: string;
  questionsRange: string;
  startQuestionNumber: number;
}
