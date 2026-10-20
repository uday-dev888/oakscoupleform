/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link as LinkIcon, Plus, X } from "lucide-react";
import {
  STUDIO_NAME,
  STUDIO_LOGO_URL,
  SUBMIT_ENDPOINT,
  ACCENT_COLOR,
  STORAGE_KEY,
} from "./constants.ts";
import {
  QuestionnaireAnswers,
  FamilyMember,
} from "./types/questionnaire.ts";
import { Header } from "./components/Header.tsx";
import { WelcomeScreen } from "./components/WelcomeScreen.tsx";
import { ChapterCard } from "./components/ChapterCard.tsx";
import { VoiceTextarea } from "./components/VoiceTextarea.tsx";
import { OptionCard } from "./components/OptionCard.tsx";
import { ImageUploader } from "./components/ImageUploader.tsx";
import { FamilyTreeBuilder } from "./components/FamilyTreeBuilder.tsx";
import { ReviewScreen } from "./components/ReviewScreen.tsx";
import { ThankYouScreen } from "./components/ThankYouScreen.tsx";

const INITIAL_ANSWERS: QuestionnaireAnswers = {
  partner1: "",
  partner2: "",
  q1_calls: { aCallsB: "", bCallsA: "" },
  q2_workPassion: { partnerA: "", partnerB: "" },
  q3_firstMeet: "",
  q4_firstImpression: { partnerA: "", partnerB: "" },
  q5_threeWords: ["", "", ""],
  q6_activities: { selected: [], other: "" },
  q7_loveMost: { partnerA: "", partnerB: "" },
  q8_funnyStory: "",
  q9_proposal: { choice: "", story: "" },
  q10_people: {
    familyMembers: [],
    treePhotoUrl: undefined,
    treeNotes: "",
  },
  q11_filmFeel: "",
  q12_references: { links: [], images: [], notes: "" },
  q13_tone: "",
  q14_moments: { selected: [], other: "" },
  q15_captureAvoid: { definitelyCapture: "", pleaseAvoid: "" },
  q16_nonNegotiables: "",
  q17_emotional: "",
  q18_cameraVersatility: "",
  q19_whatMattersMost: { selected: [], other: "" },
  q20_guidanceComfort: "",
  q21_comfortTips: { selected: [], notes: "" },
  q22_futureFeeling: "",
  q23_oneLastThing: { notes: "", images: [] },
};

// Chapters definition
const CHAPTERS = [
  {
    chapter: 1,
    title: "Your Story",
    subtitle: "How two worlds came together and what makes you smile.",
    startQ: 1,
    endQ: 9,
    range: "Questions 1–9",
  },
  {
    chapter: 2,
    title: "Your People",
    subtitle: "The family and friends who mean the world to you both.",
    startQ: 10,
    endQ: 10,
    range: "Question 10",
  },
  {
    chapter: 3,
    title: "The Look and Feel",
    subtitle: "Visual atmosphere, aesthetic tone, and creative inspiration.",
    startQ: 11,
    endQ: 13,
    range: "Questions 11–13",
  },
  {
    chapter: 4,
    title: "Your Day",
    subtitle: "The unmissable moments, traditions, and emotions.",
    startQ: 14,
    endQ: 17,
    range: "Questions 14–17",
  },
  {
    chapter: 5,
    title: "Working Together",
    subtitle: "Making you feel relaxed, confident, and completely yourself.",
    startQ: 18,
    endQ: 22,
    range: "Questions 18–22",
  },
  {
    chapter: 6,
    title: "One Last Thing",
    subtitle: "Any quiet details, surprises, or notes we should keep close.",
    startQ: 23,
    endQ: 23,
    range: "Question 23",
  },
];

export default function App() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = welcome, 1-23 = questions, 24 = review, 25 = thank you
  const [activeChapterCard, setActiveChapterCard] = useState<number | null>(null);
  const [editingFromReview, setEditingFromReview] = useState<boolean>(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState<boolean>(false);
  const [savedStepNotice, setSavedStepNotice] = useState<number>(0);

  // Link input state for Q12
  const [newLinkInput, setNewLinkInput] = useState<string>("");

  // Auto-advance debounce ref
  const autoAdvanceTimerRef = useRef<any>(null);

  // Load from localStorage or check autostart on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isAutostart = urlParams.get("autostart") === "1";

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.answers) {
          setAnswers(parsed.answers);
        }
        if (typeof parsed.step === "number" && parsed.step > 0) {
          setSavedStepNotice(parsed.step);
        }
      }

      if (isAutostart) {
        setAnswers((prev) => ({
          ...prev,
          partner1: prev.partner1 || "Aarav",
          partner2: prev.partner2 || "Meera",
        }));
        setCurrentStep(1);
      }
    } catch {
      // ignore
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, step: currentStep })
      );
    } catch {
      // ignore
    }
  }, [answers, currentStep, hasLoadedStorage]);

  // Clean up auto advance timer
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  const p1 = answers.partner1 || "Partner 1";
  const p2 = answers.partner2 || "Partner 2";

  // Check if a question transition triggers a chapter card
  const navigateToStep = (targetStep: number, isForward = true) => {
    if (editingFromReview) {
      // If editing from review, stay on targetStep or return to review
      if (targetStep > 23 || targetStep === 24) {
        setCurrentStep(24);
        setEditingFromReview(false);
        return;
      }
    }

    if (isForward && !editingFromReview) {
      const matchedChapter = CHAPTERS.find((c) => c.startQ === targetStep);
      if (matchedChapter) {
        setActiveChapterCard(matchedChapter.chapter);
        return;
      }
    }

    setCurrentStep(targetStep);
  };

  const handleNext = () => {
    if (editingFromReview) {
      setCurrentStep(24);
      setEditingFromReview(false);
      return;
    }
    navigateToStep(currentStep + 1, true);
  };

  const handleSkip = () => {
    if (editingFromReview) {
      setCurrentStep(24);
      setEditingFromReview(false);
      return;
    }
    navigateToStep(currentStep + 1, true);
  };

  const handleBack = () => {
    if (editingFromReview) {
      setCurrentStep(24);
      setEditingFromReview(false);
      return;
    }
    if (currentStep > 0) {
      navigateToStep(currentStep - 1, false);
    }
  };

  const handleSingleChoiceSelect = (
    updater: () => void,
    customNext?: () => void
  ) => {
    updater();
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (customNext) {
        customNext();
      } else {
        handleNext();
      }
    }, 350);
  };

  const handleChapterProceed = () => {
    const chapterNum = activeChapterCard;
    setActiveChapterCard(null);
    if (chapterNum) {
      const chapter = CHAPTERS.find((c) => c.chapter === chapterNum);
      if (chapter) {
        setCurrentStep(chapter.startQ);
      }
    }
  };

  // Welcome screen handlers
  const handleBegin = () => {
    navigateToStep(1, true);
  };

  const handleResume = () => {
    if (savedStepNotice >= 1 && savedStepNotice <= 24) {
      setCurrentStep(savedStepNotice);
    } else {
      setCurrentStep(1);
    }
  };

  // Reset form
  const handleReset = () => {
    setAnswers(INITIAL_ANSWERS);
    setCurrentStep(0);
    setSavedStepNotice(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Active chapter title for header
  const currentChapter = CHAPTERS.find(
    (c) => currentStep >= c.startQ && currentStep <= c.endQ
  );

  // If chapter card active, render it
  if (activeChapterCard !== null) {
    const chapter = CHAPTERS.find((c) => c.chapter === activeChapterCard);
    if (chapter) {
      return (
        <ChapterCard
          chapterNumber={
            chapter.chapter === 6 ? "One Last Thing" : chapter.chapter
          }
          title={chapter.title}
          subtitle={chapter.subtitle}
          questionRange={chapter.range}
          onProceed={handleChapterProceed}
        />
      );
    }
  }

  // Welcome Screen (Step 0)
  if (currentStep === 0) {
    return (
      <WelcomeScreen
        partner1={answers.partner1}
        partner2={answers.partner2}
        onPartner1Change={(v) =>
          setAnswers((prev) => ({ ...prev, partner1: v }))
        }
        onPartner2Change={(v) =>
          setAnswers((prev) => ({ ...prev, partner2: v }))
        }
        onBegin={handleBegin}
        hasSavedProgress={savedStepNotice > 0}
        savedStep={savedStepNotice}
        onResume={handleResume}
      />
    );
  }

  // Review Screen (Step 24)
  if (currentStep === 24) {
    return (
      <ReviewScreen
        answers={answers}
        onEditQuestion={(stepNum) => {
          setEditingFromReview(true);
          setCurrentStep(stepNum);
        }}
        onBack={() => setCurrentStep(23)}
        onSubmitted={() => setCurrentStep(25)}
      />
    );
  }

  // Thank You Screen (Step 25)
  if (currentStep === 25) {
    return <ThankYouScreen answers={answers} onReset={handleReset} />;
  }

  // Question Screens (1-23)
  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-white safe-bottom">
      {/* Sticky Header with Progress Bar */}
      <Header
        currentStep={currentStep}
        totalSteps={23}
        chapterTitle={currentChapter ? currentChapter.title : undefined}
        onBack={handleBack}
        canGoBack={true}
        editingFromReview={editingFromReview}
        onReturnToReview={() => {
          setCurrentStep(24);
          setEditingFromReview(false);
        }}
      />

      {/* Main One-Question Container */}
      <main className="flex-1 max-w-[640px] w-full mx-auto px-5 py-6 sm:py-10 flex flex-col justify-between animate-in fade-in duration-300">
        <div className="space-y-6">
          {/* QUESTION 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What do you call each other?"
                helper="Nicknames, pet names, or whatever makes you both smile."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1A1A1A]">
                    {p1} calls {p2}
                  </label>
                  <input
                    type="text"
                    value={answers.q1_calls.aCallsB}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        q1_calls: { ...prev.q1_calls, aCallsB: e.target.value },
                      }))
                    }
                    placeholder="e.g. Honey, Meeru"
                    className="w-full px-5 py-4 text-[18px] bg-white border border-[#E8E8E8] rounded-2xl focus:outline-hidden focus:border-[#1A1A1A] min-h-[58px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1A1A1A]">
                    {p2} calls {p1}
                  </label>
                  <input
                    type="text"
                    value={answers.q1_calls.bCallsA}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        q1_calls: { ...prev.q1_calls, bCallsA: e.target.value },
                      }))
                    }
                    placeholder="e.g. Captain, Aaru"
                    className="w-full px-5 py-4 text-[18px] bg-white border border-[#E8E8E8] rounded-2xl focus:outline-hidden focus:border-[#1A1A1A] min-h-[58px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What do you both do for living and what are you truly passionate about doing?"
                helper="Type, speak, or both. One box for each of you."
              />
              <div className="space-y-6">
                <VoiceTextarea
                  label={`${p1}'s work & passions`}
                  value={answers.q2_workPassion.partnerA}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q2_workPassion: {
                        ...prev.q2_workPassion,
                        partnerA: val,
                      },
                    }))
                  }
                  placeholder={`What does ${p1} do, and what lights them up outside of work?`}
                  rows={3}
                />
                <VoiceTextarea
                  label={`${p2}'s work & passions`}
                  value={answers.q2_workPassion.partnerB}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q2_workPassion: {
                        ...prev.q2_workPassion,
                        partnerB: val,
                      },
                    }))
                  }
                  placeholder={`What does ${p2} do, and what lights them up outside of work?`}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* QUESTION 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How did you first meet?"
                helper="Tell the unedited story — who saw whom first, where, and when."
              />
              <VoiceTextarea
                value={answers.q3_firstMeet}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, q3_firstMeet: val }))
                }
                placeholder="Where were you? What was the setting, the conversation, or the spark?"
                rows={5}
              />
            </div>
          )}

          {/* QUESTION 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What was your first impression of each other?"
                helper="What ran through each of your minds that very first day?"
              />
              <div className="space-y-6">
                <VoiceTextarea
                  label={`${p1}'s first impression of ${p2}`}
                  value={answers.q4_firstImpression.partnerA}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q4_firstImpression: {
                        ...prev.q4_firstImpression,
                        partnerA: val,
                      },
                    }))
                  }
                  placeholder={`What was the very first thought ${p1} had?`}
                  rows={3}
                />
                <VoiceTextarea
                  label={`${p2}'s first impression of ${p1}`}
                  value={answers.q4_firstImpression.partnerB}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q4_firstImpression: {
                        ...prev.q4_firstImpression,
                        partnerB: val,
                      },
                    }))
                  }
                  placeholder={`What was the very first thought ${p2} had?`}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* QUESTION 5 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How would you describe yourselves as a couple in three words?"
                helper="Three single words that capture your collective vibe."
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#5F5F5F] uppercase tracking-wider">
                      Word {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={answers.q5_threeWords[idx]}
                      onChange={(e) => {
                        const newWords: [string, string, string] = [
                          ...answers.q5_threeWords,
                        ];
                        newWords[idx] = e.target.value.trim();
                        setAnswers((prev) => ({
                          ...prev,
                          q5_threeWords: newWords,
                        }));
                      }}
                      placeholder={
                        idx === 0
                          ? "e.g. Playful"
                          : idx === 1
                          ? "Warm"
                          : "Grounded"
                      }
                      className="w-full px-4 py-3.5 text-[18px] text-[#1A1A1A] bg-white border border-[#E8E8E8] rounded-2xl focus:outline-hidden focus:border-[#1A1A1A] min-h-[58px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 6 */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What do you enjoy doing together?"
                helper="Select all that apply, plus anything else you love."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Travelling",
                  "Food and cafes",
                  "Movies and series",
                  "Music and concerts",
                  "Cooking together",
                  "Fitness and sports",
                  "Nature walks",
                  "Shopping",
                  "Gaming",
                  "Staying in and relaxing",
                ].map((act) => {
                  const isSelected =
                    answers.q6_activities.selected.includes(act);
                  return (
                    <OptionCard
                      key={act}
                      label={act}
                      isSelected={isSelected}
                      isMultiSelect={true}
                      onSelect={() => {
                        const current = answers.q6_activities.selected;
                        const updated = isSelected
                          ? current.filter((x) => x !== act)
                          : [...current, act];
                        setAnswers((prev) => ({
                          ...prev,
                          q6_activities: {
                            ...prev.q6_activities,
                            selected: updated,
                          },
                        }));
                      }}
                    />
                  );
                })}
              </div>
              <div className="pt-2">
                <VoiceTextarea
                  label="Anything else?"
                  value={answers.q6_activities.other}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q6_activities: { ...prev.q6_activities, other: val },
                    }))
                  }
                  placeholder="e.g. Weekend farmers markets, photography road trips, board games..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* QUESTION 7 */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What do you love most about each other?"
                helper="Speak from the heart — the little quirks, kindnesses, or strengths."
              />
              <div className="space-y-6">
                <VoiceTextarea
                  label={`What ${p1} loves most about ${p2}`}
                  value={answers.q7_loveMost.partnerA}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q7_loveMost: { ...prev.q7_loveMost, partnerA: val },
                    }))
                  }
                  placeholder={`What makes ${p2} truly special to you?`}
                  rows={3}
                />
                <VoiceTextarea
                  label={`What ${p2} loves most about ${p1}`}
                  value={answers.q7_loveMost.partnerB}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q7_loveMost: { ...prev.q7_loveMost, partnerB: val },
                    }))
                  }
                  placeholder={`What makes ${p1} truly special to you?`}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* QUESTION 8 */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Is there a funny story, inside joke, or special moment that defines your relationship?"
                helper="Something that makes the two of you burst into laughter every time."
              />
              <VoiceTextarea
                value={answers.q8_funnyStory}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, q8_funnyStory: val }))
                }
                placeholder="That time you got lost, a miscommunication that turned hilarious, or an unforgettable night..."
                rows={5}
              />
            </div>
          )}

          {/* QUESTION 9 */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How did the proposal happen? (If applicable.)"
                helper="Tap an option to continue."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionCard
                  label="Tell the story"
                  description="We had a proposal and would love to share"
                  isSelected={answers.q9_proposal.choice === "story"}
                  onSelect={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      q9_proposal: { ...prev.q9_proposal, choice: "story" },
                    }))
                  }
                />
                <OptionCard
                  label="Not applicable"
                  description="We decided together without a formal proposal"
                  isSelected={answers.q9_proposal.choice === "na"}
                  onSelect={() =>
                    handleSingleChoiceSelect(() =>
                      setAnswers((prev) => ({
                        ...prev,
                        q9_proposal: { choice: "na", story: "" },
                      }))
                    )
                  }
                />
              </div>

              {answers.q9_proposal.choice === "story" && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <VoiceTextarea
                    label="The Proposal Story"
                    value={answers.q9_proposal.story}
                    onChange={(val) =>
                      setAnswers((prev) => ({
                        ...prev,
                        q9_proposal: { ...prev.q9_proposal, story: val },
                      }))
                    }
                    placeholder="Where were you? Was it a complete surprise? How did it unfold?"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          {/* QUESTION 10 */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Who are the most important people you want us to capture please give a family tree?"
                helper="Add VIP family members, snap a photo of a tree sketch, or write it out."
              />
              <FamilyTreeBuilder
                partner1={p1}
                partner2={p2}
                members={answers.q10_people.familyMembers}
                onMembersChange={(m) =>
                  setAnswers((prev) => ({
                    ...prev,
                    q10_people: { ...prev.q10_people, familyMembers: m },
                  }))
                }
                treePhotoUrl={answers.q10_people.treePhotoUrl}
                onTreePhotoChange={(url) =>
                  setAnswers((prev) => ({
                    ...prev,
                    q10_people: { ...prev.q10_people, treePhotoUrl: url },
                  }))
                }
                treeNotes={answers.q10_people.treeNotes}
                onTreeNotesChange={(n) =>
                  setAnswers((prev) => ({
                    ...prev,
                    q10_people: { ...prev.q10_people, treeNotes: n },
                  }))
                }
              />
            </div>
          )}

          {/* QUESTION 11 */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How do you want your wedding photographs and films to feel?"
                helper="Tap an option to continue."
              />
              <div className="space-y-3">
                {[
                  "Natural and candid",
                  "Emotional and intimate",
                  "Elegant and editorial",
                  "Fun and energetic",
                  "A mix of everything",
                ].map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    isSelected={answers.q11_filmFeel === opt}
                    onSelect={() =>
                      handleSingleChoiceSelect(() =>
                        setAnswers((prev) => ({ ...prev, q11_filmFeel: opt }))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 12 */}
          {currentStep === 12 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Are there any photographers, films, or Pinterest references you love?"
                helper="Paste links, upload screenshots, or dictate names — all optional and combinable."
              />

              {/* Way A: Paste Links */}
              <div className="space-y-2 p-4 sm:p-5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Pinterest, Instagram, or video links
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={newLinkInput}
                    onChange={(e) => setNewLinkInput(e.target.value)}
                    placeholder="https://pinterest.com/..."
                    className="w-full sm:flex-1 min-w-0 px-4 py-3 text-[18px] bg-white border border-[#E8E8E8] rounded-xl focus:outline-hidden focus:border-[#1A1A1A]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newLinkInput.trim()) {
                        e.preventDefault();
                        setAnswers((prev) => ({
                          ...prev,
                          q12_references: {
                            ...prev.q12_references,
                            links: [
                              ...prev.q12_references.links,
                              newLinkInput.trim(),
                            ],
                          },
                        }));
                        setNewLinkInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLinkInput.trim()) {
                        setAnswers((prev) => ({
                          ...prev,
                          q12_references: {
                            ...prev.q12_references,
                            links: [
                              ...prev.q12_references.links,
                              newLinkInput.trim(),
                            ],
                          },
                        }));
                        setNewLinkInput("");
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 sm:py-3 bg-[#1A1A1A] text-white rounded-xl text-base sm:text-sm font-medium hover:bg-[#333333] shrink-0 flex items-center justify-center min-h-[48px] sm:min-h-0 transition-colors"
                  >
                    + Add link
                  </button>
                </div>

                {answers.q12_references.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {answers.q12_references.links.map((link, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E8E8E8] text-xs text-[#1A1A1A] max-w-full truncate"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
                        <span className="truncate">{link}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              q12_references: {
                                ...prev.q12_references,
                                links: prev.q12_references.links.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Way B: Add Images */}
              <div className="p-4 sm:p-5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl space-y-2">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Upload reference screenshots or mood photos
                </label>
                <ImageUploader
                  images={answers.q12_references.images}
                  onChange={(imgs) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q12_references: {
                        ...prev.q12_references,
                        images: imgs,
                      },
                    }))
                  }
                  maxImages={6}
                  buttonLabel="Add reference photos or screenshots"
                />
              </div>

              {/* Way C: Write/Voice Notes */}
              <div className="p-4 sm:p-5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl space-y-2">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Favorite photographers, directors, or film scenes
                </label>
                <VoiceTextarea
                  value={answers.q12_references.notes}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q12_references: {
                        ...prev.q12_references,
                        notes: val,
                      },
                    }))
                  }
                  placeholder="e.g. Wes Anderson symmetry, Wong Kar-wai romantic tones, candid film grain..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* QUESTION 13 */}
          {currentStep === 13 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What tone are you expecting to set for your wedding day"
                helper="Tap an option to continue."
              />
              <div className="space-y-3">
                {[
                  "Romantic & Intimate",
                  "Fun & Vibrant",
                  "Fashion-Forward & Editorial",
                  "Organic & Natural",
                  "Traditional & Grand",
                ].map((tone) => (
                  <OptionCard
                    key={tone}
                    label={tone}
                    isSelected={answers.q13_tone === tone}
                    onSelect={() =>
                      handleSingleChoiceSelect(() =>
                        setAnswers((prev) => ({ ...prev, q13_tone: tone }))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 14 */}
          {currentStep === 14 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What are the moments you are most looking forward to during your wedding?"
                helper="Select all that apply, plus anything unique you have planned."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Getting ready",
                  "First look or first glance",
                  "Ceremony and vows",
                  "Family blessings",
                  "Couple portraits",
                  "Grand entry",
                  "The celebration and dancing",
                  "Quiet moments together",
                  "Speeches and toasts",
                  "Send-off",
                ].map((moment) => {
                  const isSelected =
                    answers.q14_moments.selected.includes(moment);
                  return (
                    <OptionCard
                      key={moment}
                      label={moment}
                      isSelected={isSelected}
                      isMultiSelect={true}
                      onSelect={() => {
                        const current = answers.q14_moments.selected;
                        const updated = isSelected
                          ? current.filter((x) => x !== moment)
                          : [...current, moment];
                        setAnswers((prev) => ({
                          ...prev,
                          q14_moments: {
                            ...prev.q14_moments,
                            selected: updated,
                          },
                        }));
                      }}
                    />
                  );
                })}
              </div>
              <div className="pt-2">
                <VoiceTextarea
                  label="Anything else?"
                  value={answers.q14_moments.other}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q14_moments: { ...prev.q14_moments, other: val },
                    }))
                  }
                  placeholder="e.g. Flash mob with cousins, private vow reading before sunrise..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* QUESTION 15 */}
          {currentStep === 15 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Is there anything you definitely want us to capture or avoid?"
                helper="Speak or type freely in both boxes."
              />
              <div className="space-y-6">
                <VoiceTextarea
                  label="Definitely capture"
                  value={answers.q15_captureAvoid.definitelyCapture}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q15_captureAvoid: {
                        ...prev.q15_captureAvoid,
                        definitelyCapture: val,
                      },
                    }))
                  }
                  placeholder="e.g. The look on dad's face during the ceremony, candid reactions from college friends..."
                  rows={3}
                />
                <VoiceTextarea
                  label="Please avoid"
                  value={answers.q15_captureAvoid.pleaseAvoid}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q15_captureAvoid: {
                        ...prev.q15_captureAvoid,
                        pleaseAvoid: val,
                      },
                    }))
                  }
                  placeholder="e.g. Stiff table-to-table poses, overly cheesy spins, people eating at buffet..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* QUESTION 16 */}
          {currentStep === 16 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Please mention your non negotiables in your films and photographs?"
                helper="Things that are absolutely sacred to you on this day."
              />
              <VoiceTextarea
                value={answers.q16_nonNegotiables}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, q16_nonNegotiables: val }))
                }
                placeholder="e.g. Crystal clear audio of our live vows, capturing the sunset portraits on time..."
                rows={5}
              />
            </div>
          )}

          {/* QUESTION 17 */}
          {currentStep === 17 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Who do you think is going to be more emotional during wedding?"
                helper="Tap an option to continue."
              />
              <div className="space-y-3">
                {[
                  p1,
                  p2,
                  "Both of us equally",
                  "Our parents",
                  "Honestly, no idea!",
                ].map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    isSelected={answers.q17_emotional === opt}
                    onSelect={() =>
                      handleSingleChoiceSelect(() =>
                        setAnswers((prev) => ({ ...prev, q17_emotional: opt }))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 18 */}
          {currentStep === 18 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How versatile are you with the camera?"
                helper="Tap an option to continue."
              />
              <div className="space-y-3">
                {[
                  "Total natural, I love the camera",
                  "Pretty comfortable",
                  "A little shy, but willing",
                  "Very camera-shy",
                ].map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    isSelected={answers.q18_cameraVersatility === opt}
                    onSelect={() =>
                      handleSingleChoiceSelect(() =>
                        setAnswers((prev) => ({
                          ...prev,
                          q18_cameraVersatility: opt,
                        }))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 19 */}
          {currentStep === 19 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What matters most to you when choosing a wedding photography and filmmaking team?"
                helper="Pick up to 3 options."
              />
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#5F5F5F] font-semibold px-1">
                  {answers.q19_whatMattersMost.selected.length} of 3 selected
                  {answers.q19_whatMattersMost.selected.length >= 3 &&
                    " (maximum reached)"}
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    "Their style and artistry",
                    "Storytelling and film quality",
                    "Personality and how comfortable we feel",
                    "Reviews and reputation",
                    "Great communication",
                    "Experience with weddings like ours",
                    "Value for money",
                  ].map((item) => {
                    const isSelected =
                      answers.q19_whatMattersMost.selected.includes(item);
                    const isMaxReached =
                      answers.q19_whatMattersMost.selected.length >= 3;
                    const isDisabled = !isSelected && isMaxReached;

                    return (
                      <OptionCard
                        key={item}
                        label={item}
                        isSelected={isSelected}
                        isMultiSelect={true}
                        disabled={isDisabled}
                        onSelect={() => {
                          const current = answers.q19_whatMattersMost.selected;
                          if (isSelected) {
                            setAnswers((prev) => ({
                              ...prev,
                              q19_whatMattersMost: {
                                ...prev.q19_whatMattersMost,
                                selected: current.filter((x) => x !== item),
                              },
                            }));
                          } else if (current.length < 3) {
                            setAnswers((prev) => ({
                              ...prev,
                              q19_whatMattersMost: {
                                ...prev.q19_whatMattersMost,
                                selected: [...current, item],
                              },
                            }));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <VoiceTextarea
                  label="Other"
                  value={answers.q19_whatMattersMost.other}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q19_whatMattersMost: {
                        ...prev.q19_whatMattersMost,
                        other: val,
                      },
                    }))
                  }
                  placeholder="Anything else that influenced your decision?"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* QUESTION 20 */}
          {currentStep === 20 && (
            <div className="space-y-6">
              <QuestionHeader
                title="How comfortable are you with being guided or directed during portraits and filming?"
                helper="Tap an option to continue."
              />
              <div className="space-y-3">
                {[
                  "I love being guided",
                  "Happy with gentle guidance",
                  "Mostly candid, a few directions please",
                  "Please keep it candid, minimal direction",
                ].map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    isSelected={answers.q20_guidanceComfort === opt}
                    onSelect={() =>
                      handleSingleChoiceSelect(() =>
                        setAnswers((prev) => ({
                          ...prev,
                          q20_guidanceComfort: opt,
                        }))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 21 */}
          {currentStep === 21 && (
            <div className="space-y-6">
              <QuestionHeader
                title="Is there anything that would help you feel more comfortable in front of the camera?"
                helper="Select all that apply, or tell us in your own words."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "A few practice shots first",
                  "Chatting with the photographer beforehand",
                  "A moment alone as a couple",
                  "Seeing previews as we go",
                  "Not sure yet",
                ].map((tip) => {
                  const isSelected =
                    answers.q21_comfortTips.selected.includes(tip);
                  return (
                    <OptionCard
                      key={tip}
                      label={tip}
                      isSelected={isSelected}
                      isMultiSelect={true}
                      onSelect={() => {
                        const current = answers.q21_comfortTips.selected;
                        const updated = isSelected
                          ? current.filter((x) => x !== tip)
                          : [...current, tip];
                        setAnswers((prev) => ({
                          ...prev,
                          q21_comfortTips: {
                            ...prev.q21_comfortTips,
                            selected: updated,
                          },
                        }));
                      }}
                    />
                  );
                })}
              </div>

              <div className="pt-2">
                <VoiceTextarea
                  label="In your own words"
                  value={answers.q21_comfortTips.notes}
                  onChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q21_comfortTips: {
                        ...prev.q21_comfortTips,
                        notes: val,
                      },
                    }))
                  }
                  placeholder="e.g. Having music playing, having a glass of champagne, taking short breathers..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* QUESTION 22 */}
          {currentStep === 22 && (
            <div className="space-y-6">
              <QuestionHeader
                title="What do you hope to feel when you watch your wedding film years from now?"
                helper="Close your eyes and imagine watching it on your tenth anniversary."
              />
              <VoiceTextarea
                value={answers.q22_futureFeeling}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, q22_futureFeeling: val }))
                }
                placeholder="What emotions or memories do you want rushing back when you press play?"
                rows={5}
              />
            </div>
          )}

          {/* QUESTION 23: ONE LAST THING */}
          {currentStep === 23 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B08D57] block mb-1">
                  One Last Thing
                </span>
                <QuestionHeader
                  title="Is there anything else you would love us to know about you, your story, or your wedding?"
                  helper="Surprises, family dynamics, specific song requests, or any parting thoughts."
                />
              </div>

              <VoiceTextarea
                value={answers.q23_oneLastThing.notes}
                onChange={(val) =>
                  setAnswers((prev) => ({
                    ...prev,
                    q23_oneLastThing: {
                      ...prev.q23_oneLastThing,
                      notes: val,
                    },
                  }))
                }
                placeholder="Any special details, surprises planned for each other, or anything we didn't ask..."
                rows={5}
              />

              <div className="pt-2">
                <ImageUploader
                  images={answers.q23_oneLastThing.images}
                  onChange={(imgs) =>
                    setAnswers((prev) => ({
                      ...prev,
                      q23_oneLastThing: {
                        ...prev.q23_oneLastThing,
                        images: imgs,
                      },
                    }))
                  }
                  maxImages={4}
                  label="Optional photos or mood references"
                  buttonLabel="Add photos"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar (Continue & Skip) */}
        <div className="pt-8 pb-4 space-y-3">
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[58px] py-4 px-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.99] text-white font-medium text-[19px] transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            <span>
              {editingFromReview
                ? "Save & Return to Review"
                : currentStep === 23
                ? "Review your answers"
                : "Continue"}
            </span>
            <ArrowRight className="w-5 h-5 text-[#B08D57]" />
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSkip}
              className="py-2 px-4 text-sm font-medium text-[#5F5F5F] hover:text-[#1A1A1A] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const QuestionHeader: React.FC<{ title: string; helper?: string }> = ({
  title,
  helper,
}) => (
  <div className="space-y-2">
    <h2 className="font-lora text-[26px] sm:text-[32px] text-[#1A1A1A] font-normal leading-snug">
      {title}
    </h2>
    {helper && <p className="text-base sm:text-lg text-[#5F5F5F]">{helper}</p>}
  </div>
);
