/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowRight } from "lucide-react";
import { STUDIO_NAME, STUDIO_LOGO_URL } from "../constants.ts";

interface WelcomeScreenProps {
  partner1: string;
  partner2: string;
  onPartner1Change: (name: string) => void;
  onPartner2Change: (name: string) => void;
  onBegin: () => void;
  hasSavedProgress: boolean;
  savedStep: number;
  onResume: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  partner1,
  partner2,
  onPartner1Change,
  onPartner2Change,
  onBegin,
  hasSavedProgress,
  savedStep,
  onResume,
}) => {
  const isReady = partner1.trim().length > 0 && partner2.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReady) {
      onBegin();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-between px-5 py-8 sm:py-12 safe-bottom safe-top max-w-[620px] mx-auto">
      {/* Studio Brand Header - OAKS logo only with responsive size */}
      <div className="flex flex-col items-center text-center pt-3 sm:pt-6 mb-6 sm:mb-8">
        <img
          src={
            STUDIO_LOGO_URL ||
            "https://res.cloudinary.com/pcodbmuo/image/upload/v1792483927/Black_OAKS_uctgsb.webp"
          }
          alt={STUDIO_NAME}
          className="h-14 sm:h-18 md:h-20 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] object-contain mx-auto"
        />
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 sm:py-6 space-y-7 sm:space-y-8 text-center">
        {/* Editorial Headline */}
        <div className="space-y-3">
          <h1 className="font-cormorant text-[40px] sm:text-[52px] leading-[1.08] text-[#1A1A1A] font-normal tracking-tight">
            <span>Let&apos;s get to know</span>
            <span className="block font-cormorant italic text-[44px] sm:text-[58px] leading-[1.08] text-[#1A1A1A] font-normal mt-0.5">
              your story
            </span>
          </h1>

          {/* Elegant gold accent divider line */}
          <div className="w-10 h-0.5 bg-[#B08D57]/70 mx-auto mt-4 mb-3 rounded-full" />

          {/* Requested Tagline */}
          <p className="font-cormorant text-lg sm:text-[21px] text-[#5F5F5F] font-normal max-w-lg mx-auto leading-relaxed">
            The more we know your story, the more meaningfully we can tell it...
          </p>
        </div>

        {/* 3 Luxury Pillars matching the reference card design */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-3 divide-x divide-[#E8DFD3]/80 py-2">
            {/* Pillar 1: 10 Minutes */}
            <div className="flex flex-col items-center px-1 sm:px-3 text-center">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center shadow-2xs mb-2.5">
                <svg
                  className="w-6 h-6 text-[#9A7B4F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <polyline points="11 6 11 11 14.5 11" />
                  <path
                    d="M19 14.5 L19.8 17.5 L22.8 18.3 L19.8 19.1 L19 22.1 L18.2 19.1 L15.2 18.3 L18.2 17.5 Z"
                    fill="#B08D57"
                    stroke="none"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-[13px] tracking-[0.14em] uppercase font-semibold text-[#1A1A1A] leading-tight">
                10 MINUTES
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-medium text-[#7A756D] mt-0.5 leading-tight">
                AT YOUR PACE
              </span>
            </div>

            {/* Pillar 2: Auto-Saves */}
            <div className="flex flex-col items-center px-1 sm:px-3 text-center">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center shadow-2xs mb-2.5">
                <svg
                  className="w-6 h-6 text-[#9A7B4F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M5 9h7" />
                  <path d="M5 13h5" />
                  <path d="M5 17h3" />
                  <circle cx="18" cy="18" r="4" fill="#B08D57" stroke="none" />
                  <path
                    d="M16.5 18 l1 1 l2.5 -2.5"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-[13px] tracking-[0.14em] uppercase font-semibold text-[#1A1A1A] leading-tight">
                AUTO-SAVES
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-medium text-[#7A756D] mt-0.5 leading-tight">
                CONTINUOUSLY
              </span>
            </div>

            {/* Pillar 3: Voice & Typing */}
            <div className="flex flex-col items-center px-1 sm:px-3 text-center">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center shadow-2xs mb-2.5">
                <svg
                  className="w-6 h-6 text-[#9A7B4F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="10" x2="5" y2="14" />
                  <line x1="9" y1="7" x2="9" y2="17" />
                  <line x1="13" y1="5" x2="13" y2="19" />
                  <line x1="17" y1="8" x2="17" y2="16" />
                  <path
                    d="M19.5 2.5 L20 4.5 L22 5 L20 5.5 L19.5 7.5 L19 5.5 L17 5 L19 4.5 Z"
                    fill="#B08D57"
                    stroke="none"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-[13px] tracking-[0.14em] uppercase font-semibold text-[#1A1A1A] leading-tight">
                VOICE &amp; TYPING
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-medium text-[#7A756D] mt-0.5 leading-tight">
                BOTH WORK
              </span>
            </div>
          </div>
        </div>

        {/* Couple Name Inputs with Cormorant Serif styling */}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto text-left pt-2">
          {/* Partner 1 Input */}
          <div className="space-y-2">
            <label
              htmlFor="partner1-input"
              className="block font-cormorant tracking-[0.22em] text-xs sm:text-[13px] font-medium text-[#4A453E] uppercase"
            >
              YOUR FIRST NAME <span className="text-[#B08D57] font-semibold">*</span>
            </label>
            <input
              id="partner1-input"
              type="text"
              value={partner1}
              onChange={(e) => onPartner1Change(e.target.value)}
              placeholder="e.g. Maya"
              autoComplete="given-name"
              className="w-full px-5 py-4 font-cormorant text-[20px] sm:text-[22px] text-[#1A1A1A] placeholder:text-[#5F5F5F]/40 bg-white border border-[#E5DDD2] rounded-2xl focus:outline-hidden focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#B08D57]/20 shadow-xs min-h-[58px]"
            />
          </div>

          {/* Partner 2 Input */}
          <div className="space-y-2">
            <label
              htmlFor="partner2-input"
              className="block font-cormorant tracking-[0.22em] text-xs sm:text-[13px] font-medium text-[#4A453E] uppercase"
            >
              YOUR PARTNER&apos;S FIRST NAME <span className="text-[#B08D57] font-semibold">*</span>
            </label>
            <input
              id="partner2-input"
              type="text"
              value={partner2}
              onChange={(e) => onPartner2Change(e.target.value)}
              placeholder="e.g. Leo"
              autoComplete="off"
              className="w-full px-5 py-4 font-cormorant text-[20px] sm:text-[22px] text-[#1A1A1A] placeholder:text-[#5F5F5F]/40 bg-white border border-[#E5DDD2] rounded-2xl focus:outline-hidden focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#B08D57]/20 shadow-xs min-h-[58px]"
            />
          </div>

          {/* Pill Action Button matching the dark luxury button in the reference image */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={!isReady}
              className={`w-full min-h-[60px] py-4 px-6 rounded-full font-cormorant text-[21px] sm:text-[23px] tracking-wide font-normal transition-all flex items-center justify-center gap-3 ${
                isReady
                  ? "bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#2A2A2A] active:scale-[0.99] border border-[#B08D57]/60 ring-1 ring-[#B08D57]/20 shadow-md cursor-pointer"
                  : "bg-[#FAFAFA] text-[#5F5F5F]/50 border border-[#E8E8E8] cursor-not-allowed"
              }`}
            >
              <span>Begin Questionnaire</span>
              <ArrowRight className="w-5 h-5 text-[#C4A474]" />
            </button>

            {/* Resume button for returning users */}
            {hasSavedProgress && savedStep > 0 && (
              <button
                type="button"
                onClick={onResume}
                className="w-full min-h-[50px] py-3 px-4 rounded-full font-cormorant text-lg text-[#1A1A1A] hover:bg-[#FAF7F2] border border-[#E5DDD2] transition-colors"
              >
                {savedStep === 24
                  ? "Resume where you left off (Review Answers)"
                  : `Resume where you left off (Question ${savedStep} of 23)`}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Footer reassurance */}
      <div className="text-center text-xs font-light text-[#7A756D] py-2">
        A private questionnaire crafted exclusively for couples booked with{" "}
        {STUDIO_NAME}
      </div>
    </div>
  );
};
