"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useSellStore } from "@/stores/sell.store";
import { GripVertical, Star, X, Plus, CheckCircle2, Camera } from "lucide-react";

const MAX_PHOTOS = 20;

const REQUIRED_SHOTS = [
  { key: "front",    label: "Front",     icon: "⬆️" },
  { key: "rear",     label: "Rear",      icon: "⬇️" },
  { key: "side",     label: "Both Sides",icon: "↔️" },
  { key: "interior", label: "Interior",  icon: "🪑" },
  { key: "dashboard",label: "Dashboard", icon: "🎛️" },
  { key: "engine",   label: "Engine",    icon: "🔧" },
];

interface UploadState {
  progress: number; // 0-100
  done: boolean;
}

interface Props { onNext: () => void; onBack: () => void }

const EMPTY_FILES: File[] = [];

export function Step3Photos({ onNext, onBack }: Props) {
  const { data, setPhotoFiles, removePhoto, setPrimaryPhoto, reorderPhotos } = useSellStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const photoUrls = data.photoUrls ?? [];
  const photoFiles = data.photoFiles ?? EMPTY_FILES;
  const primary = data.primaryPhotoIndex ?? 0;

  // Upload progress simulation per file
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>({});
  // Drag state
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // Checked shots
  const [checkedShots, setCheckedShots] = useState<Set<string>>(new Set());

  // Simulate upload progress when new files are added
  useEffect(() => {
    photoFiles.forEach((_, i) => {
      if (uploadStates[i] !== undefined) return;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadStates((prev) => ({ ...prev, [i]: { progress: 100, done: true } }));
        } else {
          setUploadStates((prev) => ({ ...prev, [i]: { progress, done: false } }));
        }
      }, 120);
    });
  }, [photoFiles.length]); // eslint-disable-line

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const combined = [...photoFiles, ...accepted].slice(0, MAX_PHOTOS);
      setUploadStates({});
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

  // Drag-to-reorder handlers
  function handleDragStart(i: number) {
    setDragFrom(i);
  }
  function handleDragEnter(i: number) {
    setDragOver(i);
  }
  function handleDragEnd() {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      reorderPhotos(dragFrom, dragOver);
      setUploadStates({});
    }
    setDragFrom(null);
    setDragOver(null);
  }

  function toggleShot(key: string) {
    setCheckedShots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Heuristically auto-check shots by count
  const autoChecked = new Set<string>();
  REQUIRED_SHOTS.forEach((shot, i) => {
    if (photoUrls.length > i) autoChecked.add(shot.key);
  });
  const allChecked = (key: string) => checkedShots.has(key) || autoChecked.has(key);

  const totalChecked = REQUIRED_SHOTS.filter((s) => allChecked(s.key)).length;

  return (
    <div className="space-y-6">
      {/* Upload drop zone */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            Upload Photos
          </h3>
          <span className="text-xs text-slate-500 tabular-nums">
            {photoUrls.length} / {MAX_PHOTOS}
          </span>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative flex flex-col items-center justify-center min-h-44 glass rounded-2xl border-2 border-dashed border-white/15 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-5xl mb-3 opacity-30 group-hover:opacity-60 transition-opacity">📷</div>
          <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors mb-1">
            Drag & drop photos here, or click to browse
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG, WebP · Max {MAX_PHOTOS} photos · Best at 1920×1280px
          </p>
        </div>
      </div>

      {/* Required shots checklist */}
      <div className="glass rounded-2xl border border-white/8 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white">Required Shot Checklist</h4>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              totalChecked === REQUIRED_SHOTS.length
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}
          >
            {totalChecked}/{REQUIRED_SHOTS.length} covered
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {REQUIRED_SHOTS.map((shot) => {
            const checked = allChecked(shot.key);
            return (
              <button
                key={shot.key}
                type="button"
                onClick={() => toggleShot(shot.key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  checked
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "bg-[#131b2e] border-white/8 text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-base">{shot.icon}</span>
                <span className="text-[10px] font-semibold">{shot.label}</span>
                {checked && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo grid with drag-to-reorder */}
      {photoUrls.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-500" />
              Drag to reorder · Click ⭐ to set as cover
            </p>
            <button
              type="button"
              onClick={() => { setPhotoFiles([]); setUploadStates({}); }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Remove all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* Hero cover — larger first tile */}
            {photoUrls.map((url, i) => {
              const state = uploadStates[i];
              const isDone = !state || state.done;
              const progress = state?.progress ?? 100;
              const isDragging = dragFrom === i;
              const isTarget = dragOver === i && dragFrom !== i;

              return (
                <div
                  key={url}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                    i === primary
                      ? "border-blue-500 shadow-lg shadow-blue-500/25"
                      : isTarget
                      ? "border-blue-400/60 scale-105 opacity-80"
                      : "border-white/10 hover:border-white/20"
                  } ${isDragging ? "opacity-40 scale-95" : ""}`}
                  onClick={() => isDone && setPrimaryPhoto(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Upload progress overlay */}
                  {!isDone && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <div className="w-3/4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-brand rounded-full transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  )}

                  {/* Cover badge */}
                  {i === primary && isDone && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Cover
                    </div>
                  )}

                  {/* Drag handle indicator */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white/70 drop-shadow" />
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPrimaryPhoto(i); }}
                      className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                      title="Set as cover"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                        setUploadStates((prev) => {
                          const next = { ...prev };
                          delete next[i];
                          return next;
                        });
                      }}
                      className="w-7 h-7 bg-rose-600 rounded-lg flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add more slot */}
            {photoUrls.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-slate-600 hover:border-blue-500/40 hover:text-blue-400 transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add more</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Photography tips */}
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
