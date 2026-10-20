/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Send, Edit3, Loader2, AlertCircle } from "lucide-react";
import { QuestionnaireAnswers } from "../types/questionnaire.ts";
import { STUDIO_NAME, SUBMIT_ENDPOINT, ACCENT_COLOR } from "../constants.ts";
import { generateBriefSummary } from "../utils/briefGenerator.ts";

interface ReviewScreenProps {
  answers: QuestionnaireAnswers;
  onEditQuestion: (stepNumber: number) => void;
  onBack: () => void;
  onSubmitted: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  answers,
  onEditQuestion,
  onBack,
  onSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const p1 = answers.partner1 || "Partner 1";
  const p2 = answers.partner2 || "Partner 2";

  const handleSend = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const briefText = generateBriefSummary(STUDIO_NAME, answers);

    const payload = {
      names: { partner1: p1, partner2: p2 },
      submittedAt: new Date().toISOString(),
      studio: STUDIO_NAME,
      briefText,
      answers: [
        {
          number: 1,
          question: "What do you call each other?",
          answer: {
            [`${p1} calls ${p2}`]: answers.q1_calls.aCallsB,
            [`${p2} calls ${p1}`]: answers.q1_calls.bCallsA,
          },
        },
        {
          number: 2,
          question:
            "What do you both do for living and what are you truly passionate about doing?",
          answer: {
            [p1]: answers.q2_workPassion.partnerA,
            [p2]: answers.q2_workPassion.partnerB,
          },
        },
        {
          number: 3,
          question: "How did you first meet?",
          answer: answers.q3_firstMeet,
        },
        {
          number: 4,
          question: "What was your first impression of each other?",
          answer: {
            [p1]: answers.q4_firstImpression.partnerA,
            [p2]: answers.q4_firstImpression.partnerB,
          },
        },
        {
          number: 5,
          question:
            "How would you describe yourselves as a couple in three words?",
          answer: answers.q5_threeWords,
        },
        {
          number: 6,
          question: "What do you enjoy doing together?",
          answer: answers.q6_activities,
        },
        {
          number: 7,
          question: "What do you love most about each other?",
          answer: {
            [p1]: answers.q7_loveMost.partnerA,
            [p2]: answers.q7_loveMost.partnerB,
          },
        },
        {
          number: 8,
          question:
            "Is there a funny story, inside joke, or special moment that defines your relationship?",
          answer: answers.q8_funnyStory,
        },
        {
          number: 9,
          question: "How did the proposal happen? (If applicable.)",
          answer: answers.q9_proposal,
        },
        {
          number: 10,
          question:
            "Who are the most important people you want us to capture please give a family tree?",
          answer: answers.q10_people,
        },
        {
          number: 11,
          question:
            "How do you want your wedding photographs and films to feel?",
          answer: answers.q11_filmFeel,
        },
        {
          number: 12,
          question:
            "Are there any photographers, films, or Pinterest references you love?",
          answer: answers.q12_references,
        },
        {
          number: 13,
          question: "What tone are you expecting to set for your wedding day",
          answer: answers.q13_tone,
        },
        {
          number: 14,
          question:
            "What are the moments you are most looking forward to during your wedding?",
          answer: answers.q14_moments,
        },
        {
          number: 15,
          question:
            "Is there anything you definitely want us to capture or avoid?",
          answer: answers.q15_captureAvoid,
        },
        {
          number: 16,
          question:
            "Please mention your non negotiables in your films and photographs?",
          answer: answers.q16_nonNegotiables,
        },
        {
          number: 17,
          question:
            "Who do you think is going to be more emotional during wedding?",
          answer: answers.q17_emotional,
        },
        {
          number: 18,
          question: "How versatile are you with the camera?",
          answer: answers.q18_cameraVersatility,
        },
        {
          number: 19,
          question:
            "What matters most to you when choosing a wedding photography and filmmaking team?",
          answer: answers.q19_whatMattersMost,
        },
        {
          number: 20,
          question:
            "How comfortable are you with being guided or directed during portraits and filming?",
          answer: answers.q20_guidanceComfort,
        },
        {
          number: 21,
          question:
            "Is there anything that would help you feel more comfortable in front of the camera?",
          answer: answers.q21_comfortTips,
        },
        {
          number: 22,
          question:
            "What do you hope to feel when you watch your wedding film years from now?",
          answer: answers.q22_futureFeeling,
        },
        {
          number: 23,
          question:
            "Is there anything else you would love us to know about you, your story, or your wedding?",
          answer: answers.q23_oneLastThing,
        },
      ],
    };

    if (!SUBMIT_ENDPOINT) {
      // Demo mode: simulated brief submission
      setTimeout(() => {
        setIsSubmitting(false);
        onSubmitted();
      }, 700);
      return;
    }

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setIsSubmitting(false);
      onSubmitted();
    } catch {
      setIsSubmitting(false);
      setErrorMessage(
        "We could not send your answers just yet. Your words are completely safe. Please try tapping Send again."
      );
    }
  };

  return (
    <div className="max-w-[680px] mx-auto px-5 py-8 sm:py-12 safe-bottom">
      {/* Top bar with back */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E8E8]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-xl text-[#1A1A1A] hover:bg-[#FAFAFA] font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase tracking-widest font-semibold text-[#5F5F5F]">
          Review &amp; Confirm
        </span>
      </div>

      {/* Header */}
      <div className="pt-8 pb-6 space-y-2 text-center sm:text-left">
        <h1 className="font-lora text-[30px] sm:text-[38px] text-[#1A1A1A] font-normal leading-tight">
          Review your answers
        </h1>
        <p className="text-base sm:text-lg text-[#5F5F5F]">
          {p1} &amp; {p2}, take a moment to look over your story. You can edit
          any answer with a single tap.
        </p>
      </div>

      {/* Chapter 1: Your Story */}
      <section className="mt-8 space-y-4">
        <ChapterHeader title="Chapter 1: Your Story" />
        <ReviewItem
          num={1}
          question="What do you call each other?"
          answer={`${p1} calls ${p2}: "${answers.q1_calls.aCallsB || "—"}" • ${p2} calls ${p1}: "${answers.q1_calls.bCallsA || "—"}"`}
          onEdit={() => onEditQuestion(1)}
        />
        <ReviewItem
          num={2}
          question="What do you both do for living and what are you truly passionate about doing?"
          answer={`${p1}: ${answers.q2_workPassion.partnerA || "—"}\n${p2}: ${answers.q2_workPassion.partnerB || "—"}`}
          onEdit={() => onEditQuestion(2)}
        />
        <ReviewItem
          num={3}
          question="How did you first meet?"
          answer={answers.q3_firstMeet || "Skipped"}
          onEdit={() => onEditQuestion(3)}
        />
        <ReviewItem
          num={4}
          question="What was your first impression of each other?"
          answer={`${p1}: ${answers.q4_firstImpression.partnerA || "—"}\n${p2}: ${answers.q4_firstImpression.partnerB || "—"}`}
          onEdit={() => onEditQuestion(4)}
        />
        <ReviewItem
          num={5}
          question="How would you describe yourselves as a couple in three words?"
          answer={answers.q5_threeWords.filter(Boolean).join(" • ") || "Skipped"}
          onEdit={() => onEditQuestion(5)}
        />
        <ReviewItem
          num={6}
          question="What do you enjoy doing together?"
          answer={
            [
              ...(answers.q6_activities.selected || []),
              answers.q6_activities.other
                ? `Other: ${answers.q6_activities.other}`
                : null,
            ]
              .filter(Boolean)
              .join(", ") || "Skipped"
          }
          onEdit={() => onEditQuestion(6)}
        />
        <ReviewItem
          num={7}
          question="What do you love most about each other?"
          answer={`${p1}: ${answers.q7_loveMost.partnerA || "—"}\n${p2}: ${answers.q7_loveMost.partnerB || "—"}`}
          onEdit={() => onEditQuestion(7)}
        />
        <ReviewItem
          num={8}
          question="Is there a funny story, inside joke, or special moment that defines your relationship?"
          answer={answers.q8_funnyStory || "Skipped"}
          onEdit={() => onEditQuestion(8)}
        />
        <ReviewItem
          num={9}
          question="How did the proposal happen? (If applicable.)"
          answer={
            answers.q9_proposal.choice === "na"
              ? "Not applicable"
              : answers.q9_proposal.story || "Skipped"
          }
          onEdit={() => onEditQuestion(9)}
        />
      </section>

      {/* Chapter 2: Your People */}
      <section className="mt-10 space-y-4">
        <ChapterHeader title="Chapter 2: Your People" />
        <ReviewItem
          num={10}
          question="Who are the most important people you want us to capture please give a family tree?"
          answer={
            <div>
              {answers.q10_people.familyMembers?.length > 0 && (
                <div className="space-y-1 mb-2">
                  <div className="font-medium text-[#1A1A1A]">
                    {answers.q10_people.familyMembers.length} VIP family/friends
                    listed:
                  </div>
                  <ul className="list-disc list-inside text-sm text-[#5F5F5F] space-y-0.5">
                    {answers.q10_people.familyMembers.map((m) => (
                      <li key={m.id}>
                        {m.name} ({m.relationship})
                        {m.mustCapture && " — [MUST CAPTURE]"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {answers.q10_people.treePhotoUrl && (
                <p className="text-sm text-[#B08D57] font-medium">
                  ✓ Family tree photo reference attached
                </p>
              )}
              {answers.q10_people.treeNotes && (
                <p className="text-sm text-[#5F5F5F] mt-1">
                  Notes: {answers.q10_people.treeNotes}
                </p>
              )}
              {answers.q10_people.familyMembers?.length === 0 &&
                !answers.q10_people.treePhotoUrl &&
                !answers.q10_people.treeNotes && (
                  <span className="text-[#5F5F5F]">Skipped</span>
                )}
            </div>
          }
          onEdit={() => onEditQuestion(10)}
        />
      </section>

      {/* Chapter 3: The Look and Feel */}
      <section className="mt-10 space-y-4">
        <ChapterHeader title="Chapter 3: The Look and Feel" />
        <ReviewItem
          num={11}
          question="How do you want your wedding photographs and films to feel?"
          answer={answers.q11_filmFeel || "Skipped"}
          onEdit={() => onEditQuestion(11)}
        />
        <ReviewItem
          num={12}
          question="Are there any photographers, films, or Pinterest references you love?"
          answer={
            <div>
              {answers.q12_references.links?.length > 0 && (
                <div className="text-sm text-[#1A1A1A] mb-1">
                  Links: {answers.q12_references.links.join(", ")}
                </div>
              )}
              {answers.q12_references.images?.length > 0 && (
                <div className="text-sm text-[#B08D57] font-medium mb-1">
                  ✓ {answers.q12_references.images.length} reference photos attached
                </div>
              )}
              {answers.q12_references.notes && (
                <div className="text-sm text-[#5F5F5F]">
                  {answers.q12_references.notes}
                </div>
              )}
              {!answers.q12_references.links?.length &&
                !answers.q12_references.images?.length &&
                !answers.q12_references.notes && <span>Skipped</span>}
            </div>
          }
          onEdit={() => onEditQuestion(12)}
        />
        <ReviewItem
          num={13}
          question="What tone are you expecting to set for your wedding day"
          answer={answers.q13_tone || "Skipped"}
          onEdit={() => onEditQuestion(13)}
        />
      </section>

      {/* Chapter 4: Your Day */}
      <section className="mt-10 space-y-4">
        <ChapterHeader title="Chapter 4: Your Day" />
        <ReviewItem
          num={14}
          question="What are the moments you are most looking forward to during your wedding?"
          answer={
            [
              ...(answers.q14_moments.selected || []),
              answers.q14_moments.other
                ? `Other: ${answers.q14_moments.other}`
                : null,
            ]
              .filter(Boolean)
              .join(", ") || "Skipped"
          }
          onEdit={() => onEditQuestion(14)}
        />
        <ReviewItem
          num={15}
          question="Is there anything you definitely want us to capture or avoid?"
          answer={`Definitely capture: ${answers.q15_captureAvoid.definitelyCapture || "—"}\nPlease avoid: ${answers.q15_captureAvoid.pleaseAvoid || "—"}`}
          onEdit={() => onEditQuestion(15)}
        />
        <ReviewItem
          num={16}
          question="Please mention your non negotiables in your films and photographs?"
          answer={answers.q16_nonNegotiables || "Skipped"}
          onEdit={() => onEditQuestion(16)}
        />
        <ReviewItem
          num={17}
          question="Who do you think is going to be more emotional during wedding?"
          answer={answers.q17_emotional || "Skipped"}
          onEdit={() => onEditQuestion(17)}
        />
      </section>

      {/* Chapter 5: Working Together */}
      <section className="mt-10 space-y-4">
        <ChapterHeader title="Chapter 5: Working Together" />
        <ReviewItem
          num={18}
          question="How versatile are you with the camera?"
          answer={answers.q18_cameraVersatility || "Skipped"}
          onEdit={() => onEditQuestion(18)}
        />
        <ReviewItem
          num={19}
          question="What matters most to you when choosing a wedding photography and filmmaking team?"
          answer={
            [
              ...(answers.q19_whatMattersMost.selected || []),
              answers.q19_whatMattersMost.other
                ? `Other: ${answers.q19_whatMattersMost.other}`
                : null,
            ]
              .filter(Boolean)
              .join(", ") || "Skipped"
          }
          onEdit={() => onEditQuestion(19)}
        />
        <ReviewItem
          num={20}
          question="How comfortable are you with being guided or directed during portraits and filming?"
          answer={answers.q20_guidanceComfort || "Skipped"}
          onEdit={() => onEditQuestion(20)}
        />
        <ReviewItem
          num={21}
          question="Is there anything that would help you feel more comfortable in front of the camera?"
          answer={
            [
              ...(answers.q21_comfortTips.selected || []),
              answers.q21_comfortTips.notes
                ? `Notes: ${answers.q21_comfortTips.notes}`
                : null,
            ]
              .filter(Boolean)
              .join(", ") || "Skipped"
          }
          onEdit={() => onEditQuestion(21)}
        />
        <ReviewItem
          num={22}
          question="What do you hope to feel when you watch your wedding film years from now?"
          answer={answers.q22_futureFeeling || "Skipped"}
          onEdit={() => onEditQuestion(22)}
        />
      </section>

      {/* One Last Thing */}
      <section className="mt-10 space-y-4">
        <ChapterHeader title="One Last Thing" />
        <ReviewItem
          num={23}
          question="Is there anything else you would love us to know about you, your story, or your wedding?"
          answer={
            <div>
              <p>{answers.q23_oneLastThing.notes || "Skipped"}</p>
              {answers.q23_oneLastThing.images?.length > 0 && (
                <p className="text-sm text-[#B08D57] font-medium mt-1">
                  ✓ {answers.q23_oneLastThing.images.length} photos attached
                </p>
              )}
            </div>
          }
          onEdit={() => onEditQuestion(23)}
        />
      </section>

      {/* Error alert if sending fails */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Bottom Send Action */}
      <div className="sticky bottom-4 z-20 pt-8 pb-4 bg-white/95 backdrop-blur-xs">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSend}
          className="w-full min-h-[58px] py-4 px-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.99] text-white font-medium text-[19px] shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#B08D57]" />
              <span>Sending your story to {STUDIO_NAME}...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-[#B08D57]" />
              <span>Send to {STUDIO_NAME}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ChapterHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-4 pb-2 border-b border-[#E8E8E8] flex items-center gap-3">
    <div
      className="w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: ACCENT_COLOR }}
    />
    <h2 className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-[#1A1A1A]">
      {title}
    </h2>
  </div>
);

interface ReviewItemProps {
  num: number;
  question: string;
  answer: React.ReactNode;
  onEdit: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  num,
  question,
  answer,
  onEdit,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] flex flex-col sm:flex-row sm:items-start justify-between gap-3 group transition-colors hover:border-[#1A1A1A]/30">
      <div className="flex-1 space-y-1.5">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#5F5F5F]">
          Question {num}
        </span>
        <h3 className="font-lora text-[17px] sm:text-[19px] text-[#1A1A1A] font-normal leading-snug">
          {question}
        </h3>
        <div className="text-[16px] text-[#5F5F5F] leading-relaxed whitespace-pre-line pt-1">
          {answer}
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="self-end sm:self-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E8E8] hover:border-[#1A1A1A] text-xs sm:text-sm font-medium text-[#1A1A1A] transition-colors shadow-2xs"
        aria-label={`Edit question ${num}`}
      >
        <Edit3 className="w-3.5 h-3.5 text-[#B08D57]" />
        <span>Edit</span>
      </button>
    </div>
  );
};
