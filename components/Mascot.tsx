"use client";

import { useState, useEffect } from "react";

interface MascotProps {
  mood?: "happy" | "thinking" | "speaking" | "listening" | "celebrating";
  size?: "small" | "medium" | "large" | "xlarge";
  onClick?: () => void;
}

export default function Mascot({ mood = "happy", size = "medium", onClick }: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-40 h-40",
    large: "w-56 h-56",
    xlarge: "w-72 h-72 md:w-80 md:h-80",
  };

  const getMoodAnimation = () => {
    switch (mood) {
      case "speaking":
        return "animate-pulse";
      case "thinking":
        return "animate-bounce-slow";
      case "listening":
        return "animate-pulse-glow";
      case "celebrating":
        return "animate-wiggle";
      default:
        return "animate-float";
    }
  };

  const getEyeStyle = () => {
    if (isBlinking) return "scale-y-0";
    if (mood === "listening") return "scale-110";
    return "";
  };

  const getMouthShape = () => {
    switch (mood) {
      case "speaking":
        return (
          <ellipse cx="100" cy="145" rx="15" ry="12" fill="#1a1a2e" className="animate-pulse">
            <animate attributeName="ry" values="12;8;12" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        );
      case "celebrating":
        return (
          <path d="M 75 140 Q 100 165 125 140" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
      case "thinking":
        return (
          <ellipse cx="100" cy="145" rx="8" ry="8" fill="#1a1a2e" />
        );
      default:
        return (
          <path d="M 80 140 Q 100 155 120 140" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getMoodAnimation()} cursor-pointer transition-transform hover:scale-110`}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        {/* Body - Cute Robot Owl */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="bellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ears/Antennas */}
        <path d="M 55 45 L 45 20 L 65 35" fill="url(#bodyGradient)" />
        <path d="M 145 45 L 155 20 L 135 35" fill="url(#bodyGradient)" />
        <circle cx="45" cy="20" r="8" fill="#fbbf24" filter="url(#glow)" className={mood === "listening" ? "animate-ping" : ""} />
        <circle cx="155" cy="20" r="8" fill="#fbbf24" filter="url(#glow)" className={mood === "listening" ? "animate-ping" : ""} />

        {/* Main Body */}
        <ellipse cx="100" cy="110" rx="70" ry="75" fill="url(#bodyGradient)" />

        {/* Belly */}
        <ellipse cx="100" cy="130" rx="45" ry="45" fill="url(#bellyGradient)" />

        {/* Face area */}
        <ellipse cx="100" cy="95" rx="55" ry="45" fill="#f5f3ff" />

        {/* Eyes */}
        <g className={`transition-transform duration-150 ${getEyeStyle()}`}>
          {/* Left Eye */}
          <circle cx="75" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <circle cx="75" cy="90" r="12" fill="#1a1a2e" />
          <circle cx="78" cy="87" r="4" fill="white" />

          {/* Right Eye */}
          <circle cx="125" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <circle cx="125" cy="90" r="12" fill="#1a1a2e" />
          <circle cx="128" cy="87" r="4" fill="white" />
        </g>

        {/* Eyebrows based on mood */}
        {mood === "thinking" && (
          <>
            <path d="M 60 72 Q 75 68 90 72" stroke="#6366f1" strokeWidth="3" fill="none" />
            <path d="M 110 72 Q 125 68 140 72" stroke="#6366f1" strokeWidth="3" fill="none" />
          </>
        )}

        {/* Blush */}
        <ellipse cx="50" cy="105" rx="10" ry="6" fill="#fda4af" opacity="0.6" />
        <ellipse cx="150" cy="105" rx="10" ry="6" fill="#fda4af" opacity="0.6" />

        {/* Mouth */}
        {getMouthShape()}

        {/* Wings/Arms */}
        <ellipse cx="25" cy="120" rx="15" ry="30" fill="url(#bodyGradient)"
          className={mood === "celebrating" ? "origin-right animate-wiggle" : ""} />
        <ellipse cx="175" cy="120" rx="15" ry="30" fill="url(#bodyGradient)"
          className={mood === "celebrating" ? "origin-left animate-wiggle" : ""} />

        {/* Feet */}
        <ellipse cx="75" cy="180" rx="20" ry="10" fill="#fbbf24" />
        <ellipse cx="125" cy="180" rx="20" ry="10" fill="#fbbf24" />

        {/* Sparkles when celebrating */}
        {mood === "celebrating" && (
          <>
            <circle cx="30" cy="40" r="5" fill="#fbbf24" className="animate-ping" />
            <circle cx="170" cy="40" r="5" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.2s" }} />
            <circle cx="20" cy="150" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.4s" }} />
            <circle cx="180" cy="150" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.3s" }} />
          </>
        )}

        {/* Sound waves when speaking */}
        {mood === "speaking" && (
          <>
            <path d="M 170 90 Q 180 100 170 110" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
            </path>
            <path d="M 180 85 Q 195 100 180 115" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0;0.4" dur="0.5s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* Listening indicator */}
        {mood === "listening" && (
          <>
            <circle cx="100" cy="100" r="80" stroke="#10b981" strokeWidth="3" fill="none" opacity="0.3">
              <animate attributeName="r" values="80;90;80" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}
