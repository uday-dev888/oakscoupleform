/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
  isMultiSelect?: boolean;
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  description,
  imageUrl,
  isSelected,
  onSelect,
  isMultiSelect = false,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`group relative w-full text-left rounded-2xl transition-all duration-200 min-h-[58px] flex items-center justify-between p-4 sm:p-5 select-none ${
        disabled
          ? "opacity-40 cursor-not-allowed bg-[#FAFAFA] border border-[#E8E8E8]"
          : isSelected
          ? "bg-[#1A1A1A] text-white shadow-md border-transparent scale-[1.01]"
          : "bg-white text-[#1A1A1A] border border-[#E8E8E8] hover:border-[#1A1A1A]/40 hover:bg-[#FAFAFA] active:scale-[0.99] shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Optional Image Preview if provided */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-14 h-14 object-cover rounded-xl border border-white/20 shrink-0"
          />
        )}

        <div className="flex flex-col">
          <span
            className={`text-[18px] sm:text-[20px] font-medium leading-snug transition-colors ${
              isSelected ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            {label}
          </span>
          {description && (
            <span
              className={`text-sm mt-0.5 ${
                isSelected ? "text-white/80" : "text-[#5F5F5F]"
              }`}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      {/* Indicator icon */}
      <div className="shrink-0 ml-3">
        {isMultiSelect ? (
          <div
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-white border-white text-[#1A1A1A]"
                : "border-[#E8E8E8] bg-[#FAFAFA] group-hover:border-[#1A1A1A]/30"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
        ) : (
          <div
            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? "border-white bg-white"
                : "border-[#E8E8E8] bg-transparent group-hover:border-[#1A1A1A]/40"
            }`}
          >
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />}
          </div>
        )}
      </div>
    </button>
  );
};
