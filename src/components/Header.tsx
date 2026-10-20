/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Check } from "lucide-react";
import { ACCENT_COLOR } from "../constants.ts";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  chapterTitle?: string;
  onBack: () => void;
  canGoBack: boolean;
  editingFromReview?: boolean;
  onReturnToReview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  chapterTitle,
  onBack,
  canGoBack,
  editingFromReview,
  onReturnToReview,
}) => {
  const progressPercent =
    currentStep > 0 && currentStep <= totalSteps
      ? Math.round((currentStep / totalSteps) * 100)
      : currentStep > totalSteps
      ? 100
      : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E8E8E8]/70">
      {/* Thin Gold Progress Line */}
      <div className="w-full h-1 bg-[#E8E8E8]/50 overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: ACCENT_COLOR,
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between min-h-[56px]">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-xl text-[#1A1A1A] hover:bg-[#FAFAFA] active:bg-[#E8E8E8] transition-colors text-base font-medium min-h-[44px]"
              aria-label="Go back to previous question"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <div className="w-8" />
          )}

          {chapterTitle && (
            <span className="text-xs uppercase tracking-widest font-semibold text-[#5F5F5F] px-2 py-1 bg-[#FAFAFA] border border-[#E8E8E8] rounded-md hidden sm:inline-block">
              {chapterTitle}
            </span>
          )}
        </div>

        {/* Editing from Review Quick-Return */}
        {editingFromReview && onReturnToReview ? (
          <button
            onClick={onReturnToReview}
            type="button"
            className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors"
          >
            Done · Return to Review
          </button>
        ) : (
          /* Step Counter */
          currentStep > 0 &&
          currentStep <= totalSteps && (
            <div className="flex items-center gap-2 text-sm text-[#5F5F5F]">
              <span className="font-medium text-[#1A1A1A]">
                {currentStep} of {totalSteps}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#5F5F5F]/80">
                <Check className="w-3.5 h-3.5 text-[#B08D57]" />
                Auto-saved
              </span>
            </div>
          )
        )}
      </div>
    </header>
  );
};
