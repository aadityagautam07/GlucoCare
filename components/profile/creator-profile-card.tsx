"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink, Mail, Code2, MapPin, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CREATOR_INFO, GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/common/creator-credit";

export function CreatorProfileCard() {
  return (
    <Card className="overflow-hidden border-indigo-100 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white via-indigo-50/20 to-teal-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-teal-950/20">
      <CardHeader className="pb-3 border-b border-indigo-50/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Platform Developer & Contact
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                System architecture and engineering credits
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="h-3 w-3" /> Creator
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Creator Photo */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-md border border-slate-200 dark:border-slate-700 relative">
              <Image
                src="/images/aaditya-gautam.jpg"
                alt="Aaditya Gautam"
                fill
                sizes="112px"
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white" title="Active Developer">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 flex-1">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {CREATOR_INFO.name}
              </h3>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                Full-Stack Software Engineer & Platform Architect
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                Mumbai, India
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Engineered GlucoCare as a calm, intelligent diabetes and metabolic tracking platform. Built with Next.js, TypeScript, Tailwind CSS, and Apple-inspired health rings to deliver clinical clarity without daily stress.
            </p>

            {/* Social & Contact Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <a
                href={CREATOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors shadow-2xs"
              >
                <LinkedinIcon className="h-3.5 w-3.5 fill-current" />
                <span>LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>

              <a
                href={CREATOR_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <GithubIcon className="h-3.5 w-3.5 fill-current" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>

              <a
                href={CREATOR_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-95 transition-opacity shadow-2xs"
              >
                <InstagramIcon className="h-3.5 w-3.5 fill-current" />
                <span>{CREATOR_INFO.instagramHandle}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
