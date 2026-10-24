"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface HeroWithMatrixProps {
  initialUser?: {
    id: string;
    email: string;
  } | null;
  hasEnrollment?: boolean;
  activeCourseSlug?: string | null;
  activeDayNumber?: number;
  isCourseCompleted?: boolean;
}

export function HeroWithMatrix({
  initialUser = null,
  hasEnrollment = false,
  activeCourseSlug = null,
  activeDayNumber = 1,
  isCourseCompleted = false,
}: HeroWithMatrixProps) {
  const [user, setUser] = useState(initialUser);
  const [isEnrolled] = useState(hasEnrollment);
  const [courseSlug] = useState(activeCourseSlug);
  const [dayNumber] = useState(activeDayNumber);

  // Sequential word-by-word fade-in timeline
  const [word1Visible, setWord1Visible] = useState(false);
  const [word2Visible, setWord2Visible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setWord1Visible(true), 200);
    const t2 = setTimeout(() => setWord2Visible(true), 850);
    const t3 = setTimeout(() => setButtonsVisible(true), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Listen to auth changes without duplicate waterfall queries
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const resumeHref = courseSlug
    ? `/learn/${courseSlug}/day/${dayNumber}`
    : "/dashboard";

  const roadmapHref = courseSlug
    ? `/learn/${courseSlug}/roadmap`
    : "/dashboard";

  return (
    <section className="relative h-screen min-h-[600px] w-full flex flex-col items-center justify-center bg-black overflow-hidden select-none border-b-2 border-black">
      {/* Full Background MatrixRain Canvas in Pure Black */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-80 pointer-events-auto">
        <MatrixRain
          className="w-full h-full"
          background="#000000"
          color="#FAFF00"
          highlight="#FFFFFF"
          fontSize={16}
          density={0.85}
          speed={0.85}
          trail={0.88}
          pointerResponse={true}
        />
      </div>

      {/* Vignette Overlay for Depth & High Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/95 pointer-events-none z-1" />

      {/* Foreground Hero: kreepycode in exact vertical & horizontal center */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {/* Container constrained to ~70% of screen width */}
        <div className="w-[72vw] max-w-[72vw] mx-auto flex items-center justify-center">
          <h1 className="font-creepster text-[clamp(3.2rem,11.5vw,11.5rem)] leading-none tracking-wider uppercase select-none flex items-center justify-center gap-2 sm:gap-6 w-full whitespace-nowrap">
            <span
              className={`inline-block text-[#FAFF00] drop-shadow-[0_0_35px_rgba(250,255,0,0.6)] transition-all duration-700 ease-out ${
                word1Visible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-90"
              }`}
            >
              kreepy
            </span>
            <span
              className={`inline-block text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all duration-700 ease-out ${
                word2Visible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-90"
              }`}
            >
              code
            </span>
          </h1>
        </div>

        {/* 2 Buttons Pop up after name finishes, positioned directly below the centered title */}
        <div
          className={`absolute top-full mt-6 sm:mt-10 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 transition-all duration-500 ease-out ${
            buttonsVisible
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-75 translate-y-6 pointer-events-none"
          }`}
        >
          {!user ? (
            <>
              {/* Not logged in: Button 1 = Sign Up */}
              <Link href="/signup">
                <AntiMetalButton
                  label="Sign Up"
                  accentFrom="#FAFF00"
                  accentTo="#EEF200"
                  dotColor="#000000"
                  className="min-w-[170px]"
                />
              </Link>

              {/* Not logged in: Button 2 = Explore Tracks */}
              <a href="#tracks">
                <AntiMetalButton
                  label="Explore Tracks"
                  accentFrom="#FFFFFF"
                  accentTo="#E5E7EB"
                  dotColor="#000000"
                  className="min-w-[180px]"
                />
              </a>
            </>
          ) : !isEnrolled ? (
            <>
              {/* Logged in, not enrolled: Button 1 = Enroll in Track */}
              <a href="#tracks">
                <AntiMetalButton
                  label="Enroll in Track"
                  accentFrom="#FAFF00"
                  accentTo="#EEF200"
                  dotColor="#000000"
                  className="min-w-[190px]"
                />
              </a>

              {/* Logged in, not enrolled: Button 2 = Dashboard */}
              <Link href="/dashboard">
                <AntiMetalButton
                  label="Dashboard"
                  accentFrom="#FFFFFF"
                  accentTo="#E5E7EB"
                  dotColor="#000000"
                  className="min-w-[170px]"
                />
              </Link>
            </>
          ) : isCourseCompleted ? (
            <>
              {/* Course Completed: Button 1 = Enroll */}
              <a href="#tracks">
                <AntiMetalButton
                  label="Enroll"
                  accentFrom="#FAFF00"
                  accentTo="#EEF200"
                  dotColor="#000000"
                  className="min-w-[170px]"
                />
              </a>

              {/* Course Completed: Button 2 = Completed */}
              <Link href={roadmapHref}>
                <AntiMetalButton
                  label="Completed"
                  accentFrom="#FFFFFF"
                  accentTo="#E5E7EB"
                  dotColor="#000000"
                  className="min-w-[170px]"
                />
              </Link>
            </>
          ) : (
            <>
              {/* Logged in, already enrolled: Button 1 = Resume */}
              <Link href={resumeHref}>
                <AntiMetalButton
                  label={`Resume (Day ${dayNumber})`}
                  accentFrom="#FAFF00"
                  accentTo="#EEF200"
                  dotColor="#000000"
                  className="min-w-[210px]"
                />
              </Link>

              {/* Logged in, already enrolled: Button 2 = Roadmap */}
              <Link href={roadmapHref}>
                <AntiMetalButton
                  label="View Roadmap"
                  accentFrom="#FFFFFF"
                  accentTo="#E5E7EB"
                  dotColor="#000000"
                  className="min-w-[180px]"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
