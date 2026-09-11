"use client";

import { useRef, useCallback } from "react";
import { useSellStore } from "@/stores/sell.store";

const MAX_PHOTOS = 20;

interface Props { onNext: () => void; onBack: () => void }

export function Step3Photos({ onNext, onBack }: Props) {
  const { data, setPhotoFiles, removePhoto, setPrimaryPhoto } = useSellStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const photoUrls = data.photoUrls ?? [];
  const photoFiles = data.photoFiles ?? [];
  const primary = data.primaryPhotoIndex ?? 0;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const accepted = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const combined = [...photoFiles, ...accepted].slice(0, MAX_PHOTOS);
      setPhotoFiles(combined);
    },
    [photoFiles, setPhotoFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Upload Photos
          </h3>
          <span className="text-xs text-slate-600">
            {photoUrls.length} / {MAX_PHOTOS}
          </span>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative flex flex-col items-center justify-center min-h-48 glass rounded-2xl border-2 border-dashed border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-5xl mb-4 opacity-30 group-hover:opacity-50 transition-opacity">
            📷
          </div>
          <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors mb-1">
            Drag & drop photos here, or click to browse
          </p>
          <p className="text-xs text-slate-600">
            JPG, PNG, WebP · Max {MAX_PHOTOS} photos · Best at 1920×1280px
          </p>
        </div>
      </div>

      {/* Photo grid */}
      {photoUrls.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-300">
              Click a photo to set as primary (cover)
            </p>
            <button
              type="button"
              onClick={() => setPhotoFiles([])}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Remove all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photoUrls.map((url, i) => (
              <div
                key={url}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer"
                style={{
                  borderColor:
                    i === primary
                      ? "rgb(59 130 246)"
                      : "rgba(255,255,255,0.08)",
                }}
                onClick={() => setPrimaryPhoto(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary badge */}
                {i === primary && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-md">
                    Cover
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryPhoto(i);
                    }}
                    className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                    title="Set as cover"
                  >
                    ⭐
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(i);
                    }}
                    className="w-7 h-7 bg-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:bg-rose-500 transition-colors"
                    title="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* Add more slot */}
            {photoUrls.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-slate-600 hover:border-blue-500/30 hover:text-blue-400 transition-all"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs">Add more</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl border border-white/8 p-4">
        <h4 className="text-xs font-semibold text-white mb-2">📸 Photography tips</h4>
        <ul className="space-y-1">
          {[
            "Shoot in natural daylight — avoid indoor fluorescent lighting",
            "Include front, rear, both sides, interior, dashboard, engine, and tyres",
            "First photo (cover) is most important — make it count",
            "Listings with 8+ photos receive 3× more views",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="text-blue-400 mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {photoUrls.length === 0 && (
        <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400">
          ⚠️ You can skip photos for now, but listings without images receive 90% fewer views.
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          Next: Pricing →
        </button>
      </div>
    </div>
  );
}
