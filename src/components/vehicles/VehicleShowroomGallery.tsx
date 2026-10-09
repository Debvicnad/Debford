"use client";

import { useState } from "react";

interface GalleryImage {
  url: string;
  is_primary?: boolean;
  sort_order?: number;
  label?: string;
}

interface VehicleShowroomGalleryProps {
  title: string;
  images: GalleryImage[];
  condition?: string;
}

export function VehicleShowroomGallery({
  title,
  images,
  condition = "used",
}: VehicleShowroomGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback if no images
  const safeImages: GalleryImage[] =
    images && images.length > 0
      ? images
      : [
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80",
            is_primary: true,
            label: "Studio Exterior",
          },
        ];

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  return (
    <div className="space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Background Subtle Radial Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/15 via-transparent to-black pointer-events-none" />

        {/* The Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.url}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />

        {/* Ambient Vignette & Scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-blue-600/90 text-white rounded-lg backdrop-blur-md shadow-lg border border-blue-400/40">
              Verified Showcase
            </span>
            <span className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-slate-900/80 text-slate-300 rounded-lg backdrop-blur-md border border-white/10 capitalize">
              {condition}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="pointer-events-auto px-3 py-1 text-xs font-mono text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 border border-white/15 rounded-lg backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>⛶ Fullscreen</span>
          </button>
        </div>

        {/* Bottom Bar: Image Label & Counter & 360 Badge */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-black/70 text-slate-300 rounded-lg backdrop-blur-md border border-white/10">
              360° Certified Asset
            </span>
          </div>

          <div className="px-3 py-1 text-xs font-mono text-slate-300 bg-black/70 rounded-lg backdrop-blur-md border border-white/10">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        </div>

        {/* Prev / Next Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : safeImages.length - 1));
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous photo"
            >
              ❮
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < safeImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next photo"
            >
              ❯
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Carousel */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {safeImages.map((img, i) => {
            const isSelected = selectedIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative shrink-0 w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border-2 transition-all group/thumb ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/40 scale-[1.02]"
                    : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-300">
                  0{i + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
        >
          <div className="relative w-full max-w-6xl max-h-[85vh] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.url}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono flex items-center justify-center border border-white/20"
            >
              ✕
            </button>

            {/* Lightbox arrows */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : safeImages.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-black/70 text-white border border-white/20 hover:bg-black flex items-center justify-center"
                >
                  ❮
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev < safeImages.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-black/70 text-white border border-white/20 hover:bg-black flex items-center justify-center"
                >
                  ❯
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-xs font-mono text-slate-400">
            {title} · Photo {selectedIndex + 1} of {safeImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
