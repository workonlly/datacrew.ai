"use client";

import React from "react";

export default function WorkPage() {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 animate-gradient" />

      {/* Floating Particles */}
      <div className="particles" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="glass-card animate-card">
          <div className="glow-orb" />

          <h1 className="text-5xl md:text-7xl font-black text-center leading-tight">
            <span className="text-gradient block animate-title">
              Select a mask
            </span>

            <span className="underline" />
          </h1>
        </div>
      </div>

      <style jsx global>{`
        /* =====================
           Background Gradient
        ====================== */
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background: linear-gradient(
            270deg,
            #ffffff,
            #fce7f3,
            #fbcfe8,
            #f9a8d4,
            #f472b6
          );
          background-size: 400% 400%;
          animation: gradient 16s ease infinite;
        }

        /* =====================
           Glass Card
        ====================== */
        .glass-card {
          position: relative;
          padding: 4rem 5rem;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          box-shadow:
            0 20px 60px rgba(236, 72, 153, 0.25),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
          overflow: hidden;
        }

        .animate-card {
          animation: cardFloat 6s ease-in-out infinite;
        }

        /* =====================
           Glow Orb
        ====================== */
        .glow-orb {
          position: absolute;
          top: -40%;
          left: 50%;
          width: 300px;
          height: 300px;
          transform: translateX(-50%);
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.45),
            transparent 70%
          );
          filter: blur(60px);
          z-index: 0;
        }

        /* =====================
           Text Styling
        ====================== */
        .text-gradient {
          position: relative;
          z-index: 1;
          background: linear-gradient(
            90deg,
            #be185d,
            #ec4899,
            #f472b6,
            #ec4899
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 6s ease infinite;
          filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.35));
        }

        .subtitle {
          font-size: clamp(1.25rem, 2.5vw, 2rem);
          font-weight: 500;
          color: #475569;
          opacity: 0.85;
          z-index: 1;
          position: relative;
        }

        /* Underline Accent */
        .underline {
          display: block;
          margin: 2rem auto 0;
          width: 120px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent,
            #ec4899,
            transparent
          );
          animation: underlineGlow 3s ease-in-out infinite;
        }

        /* =====================
           Particles
        ====================== */
        .particles::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(#ec4899 1px, transparent 1px),
            radial-gradient(#f472b6 1px, transparent 1px);
          background-size: 80px 80px, 120px 120px;
          background-position: 0 0, 40px 60px;
          opacity: 0.15;
          animation: particlesMove 30s linear infinite;
          pointer-events: none;
        }

        /* =====================
           Animations
        ====================== */
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes underlineGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes particlesMove {
          from { transform: translateY(0); }
          to { transform: translateY(-200px); }
        }
      `}</style>
    </>
  );
}
