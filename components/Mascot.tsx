"use client";

import { useState, useEffect } from "react";

export type MascotMood =
  | "happy"
  | "thinking"
  | "speaking"
  | "listening"
  | "celebrating"
  // Movement animations
  | "jump"
  | "sit"
  | "dance"
  | "wave"
  | "spin"
  | "fly"
  | "run"
  | "stretch"
  | "bow"
  // Face expressions
  | "sleep"
  | "wink"
  | "laugh"
  | "cry"
  | "yawn"
  | "nod"
  | "shake-head"
  // Interactive
  | "clap"
  | "high-five"
  | "hug"
  | "eat";

interface MascotProps {
  mood?: MascotMood;
  size?: "small" | "medium" | "large" | "xlarge";
  onClick?: () => void;
}

export default function Mascot({ mood = "happy", size = "medium", onClick }: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking effect (except for certain moods)
  useEffect(() => {
    if (mood === "sleep" || mood === "wink" || mood === "cry") return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

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
      case "jump":
        return "animate-jump";
      case "dance":
        return "animate-dance";
      case "spin":
        return "animate-spin-infinite";
      case "wave":
        return "animate-wave";
      case "fly":
        return "animate-fly";
      case "run":
        return "animate-run";
      case "stretch":
        return "animate-stretch";
      case "bow":
        return "animate-bow";
      case "sleep":
        return "animate-sleep";
      case "laugh":
        return "animate-laugh";
      case "cry":
        return "animate-cry";
      case "yawn":
        return "animate-yawn";
      case "wink":
        return "animate-wink";
      case "nod":
        return "animate-nod";
      case "shake-head":
        return "animate-shake-head";
      case "clap":
        return "animate-clap";
      case "high-five":
        return "animate-high-five";
      case "hug":
        return "animate-hug";
      case "eat":
        return "animate-eat";
      case "sit":
        return ""; // Static pose
      default:
        return "animate-float";
    }
  };

  // Eye scale değerleri - CSS yerine SVG transform kullanacağız
  const getEyeScale = () => {
    if (mood === "sleep" || isBlinking) return { scaleX: 1, scaleY: 0.1 };
    if (mood === "listening" || mood === "jump" || mood === "high-five") return { scaleX: 1.1, scaleY: 1.1 };
    if (mood === "yawn") return { scaleX: 1, scaleY: 0.75 };
    return { scaleX: 1, scaleY: 1 };
  };

  const getLeftEye = () => {
    if (mood === "wink") {
      return (
        <g>
          <circle cx="75" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <path d="M 63 90 Q 75 95 87 90" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    if (mood === "sleep") {
      return (
        <g>
          <circle cx="75" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <path d="M 63 90 Q 75 95 87 90" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    if (mood === "cry") {
      return (
        <g>
          <circle cx="75" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <circle cx="75" cy="90" r="12" fill="#1a1a2e" />
          <circle cx="78" cy="87" r="4" fill="white" />
          <ellipse cx="70" cy="108" rx="4" ry="6" fill="#60a5fa" className="animate-tear" />
        </g>
      );
    }
    const eyeScale = getEyeScale();
    return (
      <g transform={`translate(75, 90) scale(${eyeScale.scaleX}, ${eyeScale.scaleY}) translate(-75, -90)`} style={{ transition: 'transform 0.15s ease' }}>
        <circle cx="75" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
        <circle cx="75" cy="90" r="12" fill="#1a1a2e" />
        <circle cx="78" cy="87" r="4" fill="white" />
      </g>
    );
  };

  const getRightEye = () => {
    if (mood === "wink") {
      return (
        <g>
          <circle cx="125" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <circle cx="125" cy="90" r="12" fill="#1a1a2e" />
          <circle cx="128" cy="87" r="4" fill="white" />
        </g>
      );
    }
    if (mood === "sleep") {
      return (
        <g>
          <circle cx="125" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <path d="M 113 90 Q 125 95 137 90" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    if (mood === "cry") {
      return (
        <g>
          <circle cx="125" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
          <circle cx="125" cy="90" r="12" fill="#1a1a2e" />
          <circle cx="128" cy="87" r="4" fill="white" />
          <ellipse cx="130" cy="108" rx="4" ry="6" fill="#60a5fa" className="animate-tear" style={{ animationDelay: "0.3s" }} />
        </g>
      );
    }
    const eyeScale = getEyeScale();
    return (
      <g transform={`translate(125, 90) scale(${eyeScale.scaleX}, ${eyeScale.scaleY}) translate(-125, -90)`} style={{ transition: 'transform 0.15s ease' }}>
        <circle cx="125" cy="90" r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
        <circle cx="125" cy="90" r="12" fill="#1a1a2e" />
        <circle cx="128" cy="87" r="4" fill="white" />
      </g>
    );
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
      case "laugh":
      case "high-five":
        return (
          <path d="M 75 140 Q 100 170 125 140" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
      case "thinking":
        return (
          <ellipse cx="100" cy="145" rx="8" ry="8" fill="#1a1a2e" />
        );
      case "sleep":
        return (
          <path d="M 90 145 Q 100 150 110 145" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        );
      case "cry":
        return (
          <path d="M 85 150 Q 100 140 115 150" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
      case "yawn":
        return (
          <ellipse cx="100" cy="145" rx="12" ry="18" fill="#1a1a2e">
            <animate attributeName="ry" values="18;20;18" dur="2s" repeatCount="1" />
          </ellipse>
        );
      case "eat":
        return (
          <ellipse cx="100" cy="145" rx="10" ry="8" fill="#1a1a2e">
            <animate attributeName="ry" values="8;4;8" dur="0.4s" repeatCount="indefinite" />
          </ellipse>
        );
      case "wink":
        return (
          <path d="M 85 145 Q 100 155 115 145" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
      case "jump":
      case "dance":
      case "fly":
        return (
          <path d="M 80 140 Q 100 160 120 140" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
      case "sit":
        return (
          <path d="M 85 145 Q 100 152 115 145" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        );
      default:
        return (
          <path d="M 80 140 Q 100 155 120 140" stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        );
    }
  };

  const getEyebrows = () => {
    switch (mood) {
      case "thinking":
        return (
          <>
            <path d="M 60 72 Q 75 68 90 72" stroke="#6366f1" strokeWidth="3" fill="none" />
            <path d="M 110 72 Q 125 68 140 72" stroke="#6366f1" strokeWidth="3" fill="none" />
          </>
        );
      case "cry":
        return (
          <>
            <path d="M 60 75 Q 75 80 90 75" stroke="#6366f1" strokeWidth="3" fill="none" />
            <path d="M 110 75 Q 125 80 140 75" stroke="#6366f1" strokeWidth="3" fill="none" />
          </>
        );
      case "laugh":
      case "celebrating":
      case "dance":
        return (
          <>
            <path d="M 60 78 Q 75 72 90 78" stroke="#6366f1" strokeWidth="3" fill="none" />
            <path d="M 110 78 Q 125 72 140 78" stroke="#6366f1" strokeWidth="3" fill="none" />
          </>
        );
      default:
        return null;
    }
  };

  const getWings = () => {
    const baseWingClass = mood === "celebrating" || mood === "clap" || mood === "hug" || mood === "high-five"
      ? "origin-right animate-wiggle"
      : "";
    const baseWingClass2 = mood === "celebrating" || mood === "clap" || mood === "hug" || mood === "high-five"
      ? "origin-left animate-wiggle"
      : "";

    if (mood === "wave") {
      return (
        <>
          <ellipse cx="25" cy="120" rx="15" ry="30" fill="url(#bodyGradient)" />
          <ellipse cx="175" cy="120" rx="15" ry="30" fill="url(#bodyGradient)"
            className="origin-bottom animate-wave" />
        </>
      );
    }

    if (mood === "hug") {
      return (
        <>
          <ellipse cx="35" cy="110" rx="15" ry="30" fill="url(#bodyGradient)" transform="rotate(30 35 110)" />
          <ellipse cx="165" cy="110" rx="15" ry="30" fill="url(#bodyGradient)" transform="rotate(-30 165 110)" />
        </>
      );
    }

    if (mood === "high-five") {
      return (
        <>
          <ellipse cx="25" cy="120" rx="15" ry="30" fill="url(#bodyGradient)" />
          <ellipse cx="175" cy="90" rx="15" ry="30" fill="url(#bodyGradient)" transform="rotate(-45 175 90)" />
        </>
      );
    }

    if (mood === "fly") {
      return (
        <>
          <ellipse cx="20" cy="100" rx="20" ry="35" fill="url(#bodyGradient)" className="origin-right">
            <animate attributeName="ry" values="35;25;35" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="180" cy="100" rx="20" ry="35" fill="url(#bodyGradient)" className="origin-left">
            <animate attributeName="ry" values="35;25;35" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        </>
      );
    }

    return (
      <>
        <ellipse cx="25" cy="120" rx="15" ry="30" fill="url(#bodyGradient)" className={baseWingClass} />
        <ellipse cx="175" cy="120" rx="15" ry="30" fill="url(#bodyGradient)" className={baseWingClass2} />
      </>
    );
  };

  const getFeet = () => {
    if (mood === "sit") {
      return (
        <>
          <ellipse cx="70" cy="175" rx="25" ry="12" fill="#fbbf24" />
          <ellipse cx="130" cy="175" rx="25" ry="12" fill="#fbbf24" />
        </>
      );
    }
    if (mood === "run") {
      return (
        <>
          <ellipse cx="75" cy="180" rx="20" ry="10" fill="#fbbf24">
            <animate attributeName="cx" values="75;70;75;80;75" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="125" cy="180" rx="20" ry="10" fill="#fbbf24">
            <animate attributeName="cx" values="125;130;125;120;125" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        </>
      );
    }
    if (mood === "dance") {
      return (
        <>
          <ellipse cx="75" cy="180" rx="20" ry="10" fill="#fbbf24">
            <animate attributeName="cy" values="180;175;180" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="125" cy="180" rx="20" ry="10" fill="#fbbf24">
            <animate attributeName="cy" values="180;175;180" dur="0.3s" repeatCount="indefinite" begin="0.15s" />
          </ellipse>
        </>
      );
    }
    return (
      <>
        <ellipse cx="75" cy="180" rx="20" ry="10" fill="#fbbf24" />
        <ellipse cx="125" cy="180" rx="20" ry="10" fill="#fbbf24" />
      </>
    );
  };

  const getExtras = () => {
    const extras = [];

    if (mood === "celebrating" || mood === "dance" || mood === "high-five") {
      extras.push(
        <g key="sparkles">
          <circle cx="30" cy="40" r="5" fill="#fbbf24" className="animate-ping" />
          <circle cx="170" cy="40" r="5" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.2s" }} />
          <circle cx="20" cy="150" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.4s" }} />
          <circle cx="180" cy="150" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDelay: "0.3s" }} />
        </g>
      );
    }

    if (mood === "speaking") {
      extras.push(
        <g key="soundwaves">
          <path d="M 170 90 Q 180 100 170 110" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M 180 85 Q 195 100 180 115" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0;0.4" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      );
    }

    if (mood === "listening") {
      extras.push(
        <g key="listening">
          <circle cx="100" cy="100" r="80" stroke="#10b981" strokeWidth="3" fill="none" opacity="0.3">
            <animate attributeName="r" values="80;90;80" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    }

    if (mood === "sleep") {
      extras.push(
        <g key="zzz">
          <text x="150" y="50" fill="#6366f1" fontSize="20" fontWeight="bold" className="animate-zzz">Z</text>
          <text x="165" y="35" fill="#6366f1" fontSize="16" fontWeight="bold" className="animate-zzz" style={{ animationDelay: "0.5s" }}>z</text>
          <text x="175" y="25" fill="#6366f1" fontSize="12" fontWeight="bold" className="animate-zzz" style={{ animationDelay: "1s" }}>z</text>
        </g>
      );
    }

    if (mood === "thinking") {
      extras.push(
        <g key="thinking-bubbles">
          <circle cx="160" cy="55" r="6" fill="#e0e7ff" />
          <circle cx="170" cy="40" r="4" fill="#e0e7ff" />
          <circle cx="175" cy="28" r="3" fill="#e0e7ff" />
        </g>
      );
    }

    if (mood === "dance") {
      extras.push(
        <g key="music-notes">
          <text x="20" y="60" fill="#ec4899" fontSize="18" className="animate-float">&#9834;</text>
          <text x="175" y="50" fill="#8b5cf6" fontSize="20" className="animate-float" style={{ animationDelay: "0.3s" }}>&#9835;</text>
        </g>
      );
    }

    if (mood === "hug") {
      extras.push(
        <g key="hearts">
          <text x="25" y="60" fill="#f472b6" fontSize="16" className="animate-float">&#10084;</text>
          <text x="165" y="55" fill="#f472b6" fontSize="14" className="animate-float" style={{ animationDelay: "0.3s" }}>&#10084;</text>
        </g>
      );
    }

    if (mood === "eat") {
      extras.push(
        <g key="food">
          <circle cx="100" cy="165" r="8" fill="#ef4444" />
          <ellipse cx="100" cy="160" rx="3" ry="2" fill="#22c55e" />
        </g>
      );
    }

    if (mood === "run") {
      extras.push(
        <g key="sweat">
          <ellipse cx="55" cy="75" rx="3" ry="5" fill="#60a5fa" className="animate-tear" />
        </g>
      );
    }

    if (mood === "jump") {
      extras.push(
        <g key="stars">
          <text x="30" y="70" fill="#fbbf24" fontSize="14" className="animate-ping">&#9733;</text>
          <text x="165" y="65" fill="#fbbf24" fontSize="12" className="animate-ping" style={{ animationDelay: "0.2s" }}>&#9733;</text>
        </g>
      );
    }

    return extras;
  };

  const getBodyTransform = () => {
    if (mood === "sit") {
      return "translate(0, 15) scale(1, 0.85)";
    }
    if (mood === "bow") {
      return "rotate(10, 100, 180)";
    }
    return "";
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getMoodAnimation()} cursor-pointer hover:scale-110`}
      style={{ transformOrigin: 'center bottom', transition: 'transform 0.2s ease' }}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
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

        <g transform={getBodyTransform()}>
          <path d="M 55 45 L 45 20 L 65 35" fill="url(#bodyGradient)" />
          <path d="M 145 45 L 155 20 L 135 35" fill="url(#bodyGradient)" />
          <circle cx="45" cy="20" r="8" fill="#fbbf24" filter="url(#glow)" className={mood === "listening" ? "animate-ping" : ""} />
          <circle cx="155" cy="20" r="8" fill="#fbbf24" filter="url(#glow)" className={mood === "listening" ? "animate-ping" : ""} />

          <ellipse cx="100" cy="110" rx="70" ry="75" fill="url(#bodyGradient)" />
          <ellipse cx="100" cy="130" rx="45" ry="45" fill="url(#bellyGradient)" />
          <ellipse cx="100" cy="95" rx="55" ry="45" fill="#f5f3ff" />

          {getLeftEye()}
          {getRightEye()}
          {getEyebrows()}

          <ellipse cx="50" cy="105" rx="10" ry="6" fill="#fda4af" opacity="0.6" />
          <ellipse cx="150" cy="105" rx="10" ry="6" fill="#fda4af" opacity="0.6" />

          {getMouthShape()}
          {getWings()}
          {getFeet()}
        </g>

        {getExtras()}
      </svg>
    </div>
  );
}
