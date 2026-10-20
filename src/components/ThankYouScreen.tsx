/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, Download, FileText, Printer, Heart, RefreshCw } from "lucide-react";
import { QuestionnaireAnswers } from "../types/questionnaire.ts";
import { STUDIO_NAME, STUDIO_LOGO_URL, SUBMIT_ENDPOINT, ACCENT_COLOR } from "../constants.ts";
import { generateBriefSummary } from "../utils/briefGenerator.ts";

interface ThankYouScreenProps {
  answers: QuestionnaireAnswers;
  onReset: () => void;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  answers,
  onReset,
}) => {
  const [showBriefPreview, setShowBriefPreview] = useState(false);
  const p1 = answers.partner1 || "Partner 1";
  const p2 = answers.partner2 || "Partner 2";

  const briefText = generateBriefSummary(STUDIO_NAME, answers);

  const downloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(answers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `our-story-${p1.toLowerCase()}-${p2.toLowerCase()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadBriefTxt = () => {
    const dataStr =
      "data:text/plain;charset=utf-8," + encodeURIComponent(briefText);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `studio-brief-${p1.toLowerCase()}-${p2.toLowerCase()}.txt`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between px-5 py-10 sm:py-16 safe-bottom max-w-[640px] mx-auto text-center">
      {/* Brand accent ornament */}
      <div className="flex flex-col items-center">
        {STUDIO_LOGO_URL ? (
          <div className="flex flex-col items-center mb-4">
            <img
              src={STUDIO_LOGO_URL}
              alt={STUDIO_NAME}
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[180px] sm:max-w-[220px] object-contain"
            />
          </div>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FAFAFA] border border-[#E8E8E8] mb-3 shadow-2xs"
              style={{ borderColor: `${ACCENT_COLOR}40` }}
            >
              <Heart className="w-5 h-5 text-[#B08D57] fill-[#B08D57]/20" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#5F5F5F]">
              {STUDIO_NAME}
            </span>
          </>
        )}
      </div>

      {/* Main warm message */}
      <div className="my-auto py-8 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#E8E8E8] shadow-xs">
          <CheckCircle2 className="w-9 h-9 text-[#B08D57]" />
        </div>

        <div className="space-y-3">
          <h1 className="font-lora text-[34px] sm:text-[44px] text-[#1A1A1A] font-normal leading-tight">
            Thank you, {p1} &amp; {p2}
          </h1>
          <p className="text-lg sm:text-xl text-[#5F5F5F] max-w-lg mx-auto leading-relaxed">
            Your answers have been safely received. We can’t wait to celebrate and
            capture your day with all the heart and artistry it deserves.
          </p>
        </div>

        {/* Quiet confirmation badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAFAFA] border border-[#E8E8E8] text-sm text-[#5F5F5F]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Your answers have been sent to our production crew</span>
        </div>

        {/* Demo Mode / Download options */}
        <div className="pt-6 space-y-3 max-w-md mx-auto">
          {!SUBMIT_ENDPOINT && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs text-[#5F5F5F] text-left space-y-1">
              <span className="font-semibold text-[#1A1A1A]">
                Studio Demo Mode Active
              </span>
              <p>
                SUBMIT_ENDPOINT is currently empty in settings. You can download
                the compiled couple responses as JSON and a formatted studio brief.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={downloadBriefTxt}
              className="min-h-[52px] px-4 py-3 rounded-xl bg-white hover:bg-[#FAFAFA] border border-[#E8E8E8] text-[#1A1A1A] font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-[#B08D57]" />
              <span>Download Brief (.txt)</span>
            </button>

            <button
              type="button"
              onClick={downloadJson}
              className="min-h-[52px] px-4 py-3 rounded-xl bg-white hover:bg-[#FAFAFA] border border-[#E8E8E8] text-[#1A1A1A] font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#B08D57]" />
              <span>Download Raw JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBriefPreview(true)}
            className="w-full min-h-[50px] px-4 py-2.5 rounded-xl text-sm font-medium text-[#5F5F5F] hover:text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
          >
            View Formatted Studio Brief On Screen
          </button>
        </div>
      </div>

      {/* Footer action */}
      <div className="pt-4 flex items-center justify-center gap-4 text-xs text-[#5F5F5F]">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start new questionnaire</span>
        </button>
      </div>

      {/* Brief Preview Modal */}
      {showBriefPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-[#1A1A1A]">
                  Studio Brief Preview
                </h3>
                <span className="text-xs text-[#5F5F5F]">
                  {p1} &amp; {p2} · {STUDIO_NAME}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 rounded-lg text-[#5F5F5F] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]"
                  title="Print brief"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBriefPreview(false)}
                  className="p-2 rounded-lg text-[#5F5F5F] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#1A1A1A] bg-[#FAFAFA]">
              {briefText}
            </div>

            <div className="p-4 border-t border-[#E8E8E8] bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setShowBriefPreview(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333333]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
