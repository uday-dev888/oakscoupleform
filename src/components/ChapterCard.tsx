/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface ChapterCardProps {
  chapterNumber: number | string;
  title: string;
  subtitle?: string;
  questionRange?: string;
  onProceed: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapterNumber,
  title,
  subtitle,
  questionRange,
  onProceed,
}) => {
  useEffect(() => {
    // Auto-advance after 1.5 seconds as specified
    const timer = setTimeout(() => {
      onProceed();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onProceed]);

  return (
    <div
      onClick={onProceed}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onProceed();
        }
      }}
      className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6 sm:p-12 cursor-pointer select-none animate-in fade-in duration-300"
      aria-label={`${typeof chapterNumber === 'number' ? `Chapter ${chapterNumber}` : chapterNumber}: ${title}. Tap anywhere to continue.`}
    >
      {/* Top Brand Tag */}
      <div className="flex items-center justify-between text-xs sm:text-sm tracking-widest uppercase text-[#5F5F5F]">
        <span>
          {typeof chapterNumber === "number"
            ? `Chapter 0${chapterNumber}`
            : chapterNumber}
        </span>
        {questionRange && <span>{questionRange}</span>}
      </div>

      {/* Center Magazine Title Block */}
      <div className="max-w-[640px] mx-auto text-center space-y-4 my-auto">
        <h2 className="font-lora text-[36px] sm:text-[48px] font-normal text-[#1A1A1A] leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg sm:text-xl text-[#5F5F5F] max-w-md mx-auto font-light">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="max-w-[640px] w-full mx-auto flex items-center justify-between text-sm text-[#5F5F5F]">
        <span className="text-xs text-[#5F5F5F]">Auto-advancing...</span>
        <div className="flex items-center gap-1.5 font-medium text-[#1A1A1A]">
          <span>Tap to continue</span>
          <ArrowRight className="w-4 h-4 text-[#B08D57]" />
        </div>
      </div>
    </div>
  );
};
