"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeartPulse,
  Activity as GlucoseIcon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronDown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CREATOR_INFO,
  CreatorCard,
  CreatorBadge,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
} from "@/components/common/creator-credit";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "Does GlucoCare provide medical diagnoses or prescribe insulin doses?",
      a: "No. GlucoCare is strictly a daily tracking and self-care organization companion. It summarizes your user-entered readings and routine habits so you can review them clearly with your healthcare provider. It will never autonomously alter medication dosages or diagnose medical conditions.",
    },
    {
      q: "Can I choose between mg/dL and mmol/L?",
      a: "Yes. GlucoCare supports both mg/dL (common in the US and India) and mmol/L (standard in the UK, Canada, and Australia). You can configure your preference in your settings at any time.",
    },
    {
      q: "Can I generate reports to bring to my doctor?",
      a: "Yes. In the Reports section, you can generate 7-day, 14-day, 30-day, or 90-day comprehensive clinical summaries including average glucose, estimated A1c conversion, medication adherence percentages, and full reading logs, complete with one-click print or PDF export.",
    },
    {
      q: "Is my personal health information secure and private?",
      a: "Absolutely. Health data is protected with secure session management, hashed credentials, and strict per-user database isolation. Sensitive health information is never exposed through URL parameters.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Gluco<span className="text-teal-600">Care</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-slate-900 transition-colors">
              Privacy & Trust
            </a>
            <a href="#creator" className="hover:text-slate-900 transition-colors">
              Creator
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Calm, modern daily diabetes tracking</span>
                </div>
                <CreatorBadge />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Manage your diabetes with <span className="text-indigo-700">clarity</span>.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Track glucose, medications, meals, and activity in one simple place. Designed to empower your day without overwhelming medical jargon.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-indigo-700 hover:bg-indigo-800 text-white shadow-md font-semibold gap-2">
                    <span>Try Demo Patient</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 font-semibold">
                    Create Free Account
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Non-diagnostic & safe
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Doctor-ready summary reports
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Fast 10-second logging
                </span>
              </div>
            </div>

            {/* Right Hero Dashboard Mockup Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl bg-slate-900/5 p-2 ring-1 ring-slate-900/10 shadow-2xl">
                {/* Mockup Card */}
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                  {/* Mock Window Top Bar */}
                  <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      GlucoCare — Eleanor Brooks (Type 2)
                    </span>
                    <div className="w-6" />
                  </div>

                  {/* Mock Content */}
                  <div className="p-5 space-y-4 bg-slate-50/50">
                    {/* Hero Glucose Widget */}
                    <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 p-5 text-white shadow-sm">
                      <div className="flex items-center justify-between text-xs text-indigo-200">
                        <span>Today&apos;s Latest Glucose</span>
                        <span>1:42 PM (Post-lunch)</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-black">118</span>
                        <span className="text-sm font-medium text-indigo-200">mg/dL</span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Within configured target (70–180)
                      </div>
                    </div>

                    {/* Quick Metric Tiles */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Average</span>
                        <p className="text-lg font-bold text-slate-900">114 mg/dL</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Meds</span>
                        <p className="text-lg font-bold text-teal-700">2 of 3 taken</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Activity</span>
                        <p className="text-lg font-bold text-emerald-700">35 mins</p>
                      </div>
                    </div>

                    {/* Checklist preview */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Today&apos;s Plan
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="line-through">Morning Metformin (500 mg)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                        <span>Evening walk (20–30 mins)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillar Feature Cards */}
      <section id="features" className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              Simple & Thoughtful Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Designed around how patients actually live
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              No bloated clutter. Three clear pillars help you keep daily tracking effortless and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Track */}
            <Card className="p-6 rounded-3xl border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-indigo-200">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5">
                <GlucoseIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                1. Track in Seconds
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log fasting and post-meal glucose readings, active prescriptions, meals, and physical activity with 10-second fast actions on mobile or desktop.
              </p>
            </Card>

            {/* Pillar 2: Understand */}
            <Card className="p-6 rounded-3xl border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-teal-200">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                2. Understand Trends
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clean interactive Recharts show your 7, 14, 30, and 90-day glucose trends against your configured target ranges, with friendly observational statements.
              </p>
            </Card>

            {/* Pillar 3: Stay Organized */}
            <Card className="p-6 rounded-3xl border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-amber-200">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                3. Stay Organized
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Daily checklists for doses and checks, specialist visit scheduling, and printable clinical reports ensure you and your doctor are always aligned.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Day-in-the-Life
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              A calm routine from morning to night
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Step 1 • Morning
              </span>
              <h4 className="text-base font-bold text-slate-900">Check & Breakfast</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record fasting glucose reading in seconds and mark your morning Metformin dose as taken.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                Step 2 • Afternoon
              </span>
              <h4 className="text-base font-bold text-slate-900">Lunch & Movement</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log your lunch and a quick 20-minute neighborhood walk. Notice how activity keeps glucose steady.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Step 3 • Evening
              </span>
              <h4 className="text-base font-bold text-slate-900">Dinner & Evening Med</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take evening medication with dinner and complete your daily checklist items before relaxing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                Step 4 • Clinic Visit
              </span>
              <h4 className="text-base font-bold text-slate-900">Doctor Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export or print your 30 or 90-day summary with estimated A1c and target range stats for your endocrinologist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section id="privacy" className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Privacy & Medical Responsibility</h3>
                <p className="text-xs text-slate-400">Strict patient data isolation</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              We treat health information as sensitive personal property. GlucoCare follows a clear medical safety principle: the platform is solely an organizational and tracking tool. We never sell your data, expose health parameters in URL strings, or make autonomous medical recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Strict Session Isolation</span>
                You only ever access your own records.
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Zero Medical Advice</span>
                Observational summaries, not diagnoses.
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Full Portability</span>
                Print or export all data at any moment.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              Questions & Answers
            </h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-indigo-700" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator & Developer Showcase Section */}
      <section id="creator" className="py-16 md:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              Meet The Developer
            </h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              Crafted with Care & Precision
            </p>
          </div>
          <CreatorCard />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-tr from-indigo-800 to-teal-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Take control of your daily diabetes care today
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Experience a calm, accessible, and supportive tracking platform designed specifically for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-md">
                Launch Interactive Demo
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-700 text-white flex items-center justify-center">
              <HeartPulse className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-900">GlucoCare</span>
            <span>— Modern Diabetes Management</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span>
              Designed & Developed by{" "}
              <a
                href={CREATOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-700 hover:underline"
              >
                Aaditya Gautam
              </a>
            </span>
            <div className="flex items-center gap-2.5 text-slate-400">
              <a
                href={CREATOR_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="GitHub: aadityagautam07"
              >
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={CREATOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0077b5] transition-colors"
                title="LinkedIn: aadityagautam07"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={CREATOR_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition-colors"
                title="Instagram: @aadityagautam__"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
