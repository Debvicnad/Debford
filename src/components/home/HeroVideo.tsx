"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";

interface HeroVideoProps {
  posterSrc?: string;
  videoSrc?: string;
}

export function HeroVideo({
  posterSrc = "/images/home/hero-garage-entry.jpg",
  videoSrc = "/videos/debford-garage-entry.mp4",
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Respect user's reduced motion preferences
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setIsPlaying(false);
    }

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      {/* Fallback & Primary High-Res Poster Image */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          hasVideo && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Image
          src={posterSrc}
          alt="Debford Garage Arrival — High Performance Vehicle Entering Modern Architectural Sanctuary"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 animate-fade-in"
          quality={92}
        />
      </div>

      {/* Video layer (if video asset is present) */}
      {!reducedMotion && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            hasVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      )}

      {/* Cinematic Overlays */}
      {/* 1. Dark Vignette & Edge Shadow */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/85 pointer-events-none" />

      {/* 2. Architectural Dusk Ambient Tint (Midnight Navy + Warm Rim Glow) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14]/80 via-transparent to-[#0a0d14]/80 pointer-events-none" />

      {/* 3. Subtle grid scanlines for engineering feel */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Play/Pause Control (Accessible) */}
      {hasVideo && (
        <div className="absolute bottom-8 right-8 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause background video" : "Play background video"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs text-slate-300 hover:text-white transition-all duration-200"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5 text-blue-400" />}
            <span className="hidden sm:inline font-mono tracking-wider">
              {isPlaying ? "PAUSE MOTION" : "PLAY MOTION"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
