/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { compressImage } from "../utils/imageCompressor.ts";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  buttonLabel?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 6,
  label,
  buttonLabel = "Add images",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const remainingSlots = maxImages - images.length;
      const filesToProcess = files.slice(0, remainingSlots);

      const compressedPromises = filesToProcess.map((file) => compressImage(file));
      const newCompressedImages = await Promise.all(compressedPromises);

      onChange([...images, ...newCompressedImages]);
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Support paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        processFiles(e.clipboardData.files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [images]);

  return (
    <div className="w-full space-y-3">
      {label && (
        <span className="block text-sm font-medium text-[#5F5F5F]">{label}</span>
      )}

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="group relative aspect-4/3 rounded-xl overflow-hidden border border-[#E8E8E8] bg-[#FAFAFA] shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`Uploaded reference ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#1A1A1A]/80 text-white hover:bg-[#1A1A1A] flex items-center justify-center transition-all shadow-xs"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button & Drop Target */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) {
              processFiles(e.dataTransfer.files);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-colors ${
            dragOver
              ? "border-[#1A1A1A] bg-[#FAFAFA]"
              : "border-[#E8E8E8] hover:border-[#1A1A1A]/30 bg-white"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-file-input"
          />

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[56px] flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-[#FAFAFA] hover:bg-[#E8E8E8]/70 text-[#1A1A1A] text-base font-medium transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#B08D57]" />
                <span>Preparing image...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-[#B08D57]" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
          <span className="block text-xs text-[#5F5F5F] mt-2">
            Gallery, camera, drag-and-drop or paste
          </span>
        </div>
      )}
    </div>
  );
};
