"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const audiences = [
  { icon: "\u{1F4F8}", title: "\u05E6\u05DC\u05DE\u05D9\u05DD", desc: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD, \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA, \u05E7\u05D1\u05E6\u05D9\u05DD \u05D5\u05DE\u05E1\u05D9\u05E8\u05D5\u05EA" },
  { icon: "\u{1F3AC}", title: "\u05D9\u05D5\u05E6\u05E8\u05D9 \u05EA\u05D5\u05DB\u05DF", desc: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E9\u05EA\u05F4\u05E4\u05D9\u05DD, \u05D1\u05E8\u05D9\u05E4\u05D9\u05DD, \u05EA\u05D5\u05E6\u05E8\u05D9\u05DD \u05D5\u05E4\u05DC\u05D8\u05E4\u05D5\u05E8\u05DE\u05D5\u05EA" },
  { icon: "\u{1F4F1}", title: "\u05DE\u05E0\u05D4\u05DC\u05D5\u05EA \u05E1\u05D5\u05E9\u05D9\u05D0\u05DC", desc: "\u05DC\u05D5\u05D7 \u05EA\u05D5\u05DB\u05DF, deliverables, \u05E1\u05D8\u05D8\u05D5\u05E1 \u05E4\u05D5\u05E1\u05D8\u05D9\u05DD" },
  { icon: "\u{1F3AF}", title: "\u05DE\u05E4\u05D9\u05E7\u05D9\u05DD \u05D5\u05E4\u05E8\u05D9\u05DC\u05E0\u05E1\u05E8\u05D9\u05DD", desc: "\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA, \u05E6\u05D5\u05D5\u05EA, \u05DC\u05D5\u05D7\u05D5\u05EA \u05D6\u05DE\u05E0\u05D9\u05DD \u05D5\u05E1\u05E4\u05E7\u05D9\u05DD" },
];

const painPoints = [
  { before: "\u05DC\u05D9\u05D3\u05D9\u05DD \u05E0\u05D5\u05E4\u05DC\u05D9\u05DD \u05D1\u05D9\u05DF \u05D4\u05DB\u05D9\u05E1\u05D0\u05D5\u05EA", after: "Pipeline \u05D7\u05DB\u05DD \u05E9\u05DC\u05D0 \u05DE\u05E4\u05E1\u05E4\u05E1 \u05D0\u05E3 \u05DC\u05D9\u05D3" },
  { before: "\u05D0\u05D9\u05DF \u05E1\u05D3\u05E8 \u05D1\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD", after: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05E2\u05DD \u05E9\u05DC\u05D1\u05D9\u05DD \u05D5\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA" },
  { before: "\u05DC\u05D0 \u05D9\u05D5\u05D3\u05E2 \u05DB\u05DE\u05D4 \u05D4\u05E8\u05D5\u05D5\u05D7\u05EA\u05D9", after: "\u05D3\u05E9\u05D1\u05D5\u05E8\u05D3 \u05E2\u05DD \u05D2\u05E8\u05E4\u05D9\u05DD \u05D5-KPIs \u05D1\u05D6\u05DE\u05DF \u05D0\u05DE\u05EA" },
  { before: "\u05D4\u05DB\u05DC \u05DE\u05E4\u05D5\u05D6\u05E8 \u05D1\u05D0\u05E7\u05E1\u05DC\u05D9\u05DD", after: "\u05D4\u05DB\u05DC \u05D1\u05DE\u05E7\u05D5\u05DD \u05D0\u05D7\u05D3 \u2014 CRM, \u05DC\u05D5\u05D7 \u05EA\u05D5\u05DB\u05DF, \u05EA\u05E1\u05E8\u05D9\u05D8\u05D9\u05DD" },
];

const features = [
  { icon: "\u{1F504}", title: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05DC\u05D9\u05D3\u05D9\u05DD", desc: "Pipeline \u05D7\u05DB\u05DD \u05DE\u05DC\u05D9\u05D3 \u05D7\u05D3\u05E9 \u05D5\u05E2\u05D3 \u05E1\u05D2\u05D9\u05E8\u05D4, \u05DB\u05D5\u05DC\u05DC \u05D0\u05E0\u05DC\u05D9\u05D8\u05D9\u05E7\u05D4" },
  { icon: "\u{1F4CB}", title: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD", desc: "\u05E7\u05E0\u05D1\u05DF, \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA, \u05E9\u05DC\u05D1\u05D9\u05DD, \u05D3\u05D3\u05DC\u05D9\u05D9\u05E0\u05D9\u05DD \u05D5\u05DE\u05E2\u05E7\u05D1 \u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA" },
  { icon: "\u{1F4C5}", title: "\u05DC\u05D5\u05D7 \u05EA\u05D5\u05DB\u05DF", desc: "\u05EA\u05DB\u05E0\u05D5\u05DF \u05EA\u05D5\u05DB\u05DF \u05D7\u05D5\u05D3\u05E9\u05D9, \u05E1\u05D8\u05D8\u05D5\u05E1 \u05E4\u05D5\u05E1\u05D8\u05D9\u05DD \u05D5\u05D9\u05D9\u05E6\u05D5\u05D0 \u05DC\u05E7\u05DC\u05E0\u05D3\u05E8" },
  { icon: "\u{1F4DD}", title: "\u05EA\u05E1\u05E8\u05D9\u05D8\u05D9\u05DD", desc: "\u05DB\u05EA\u05D9\u05D1\u05EA \u05EA\u05E1\u05E8\u05D9\u05D8\u05D9\u05DD \u05E2\u05DD AI, \u05E9\u05D5\u05D8 \u05DC\u05D9\u05E1\u05D8 \u05D5\u05E7\u05D5\u05DC \u05E9\u05D9\u05D8" },
  { icon: "\u{1F4B0}", title: "\u05DB\u05E1\u05E4\u05D9\u05DD", desc: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05D5\u05EA, \u05D4\u05E6\u05E2\u05D5\u05EA \u05DE\u05D7\u05D9\u05E8, \u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D5\u05DE\u05E2\u05E7\u05D1 \u05D4\u05DB\u05E0\u05E1\u05D5\u05EA" },
  { icon: "\u{1F3A8}", title: "\u05DE\u05D5\u05D3 \u05D1\u05D5\u05E8\u05D3", desc: "\u05DC\u05D5\u05D7 \u05D4\u05E9\u05E8\u05D0\u05D4 \u05D5\u05D9\u05D6\u05D5\u05D0\u05DC\u05D9 \u05E2\u05DD \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA, \u05E6\u05D1\u05E2\u05D9\u05DD \u05D5\u05D4\u05E2\u05E8\u05D5\u05EA" },
];

const steps = [
  { num: "1", title: "\u05E0\u05E8\u05E9\u05DE\u05D9\u05DD \u05D1\u05D7\u05D9\u05E0\u05DD", desc: "\u05D9\u05D5\u05E6\u05E8\u05D9\u05DD \u05D7\u05E9\u05D1\u05D5\u05DF \u05D1-30 \u05E9\u05E0\u05D9\u05D5\u05EA" },
  { num: "2", title: "\u05DE\u05D2\u05D3\u05D9\u05E8\u05D9\u05DD \u05D0\u05EA \u05D4\u05E2\u05E1\u05E7", desc: "\u05D1\u05D5\u05D7\u05E8\u05D9\u05DD \u05E1\u05D5\u05D2 \u05E2\u05E1\u05E7 \u05D5\u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DC\u05D4\u05D5\u05E1\u05D9\u05E3 \u05DC\u05D9\u05D3\u05D9\u05DD" },
  { num: "3", title: "\u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05D4\u05DB\u05DC \u05DE\u05DE\u05E7\u05D5\u05DD \u05D0\u05D7\u05D3", desc: "\u05DC\u05D9\u05D3\u05D9\u05DD, \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD, \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05D5\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD" },
];

const faqs = [
  { q: "\u05D4\u05D0\u05DD \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05EA\u05D0\u05D9\u05DE\u05D4 \u05DC\u05D9?", a: "Planify \u05E0\u05D1\u05E0\u05EA\u05D4 \u05D1\u05DE\u05D9\u05D5\u05D7\u05D3 \u05DC\u05E6\u05DC\u05DE\u05D9\u05DD, \u05D9\u05D5\u05E6\u05E8\u05D9 \u05EA\u05D5\u05DB\u05DF, \u05DE\u05E0\u05D4\u05DC\u05D5\u05EA \u05E1\u05D5\u05E9\u05D9\u05D0\u05DC \u05D5\u05DE\u05E4\u05D9\u05E7\u05D9\u05DD." },
  { q: "\u05DB\u05DE\u05D4 \u05E2\u05D5\u05DC\u05D4?", a: "\u05D9\u05E9 \u05EA\u05D5\u05DB\u05E0\u05D9\u05EA \u05D7\u05D9\u05E0\u05DE\u05D9\u05EA \u05DC-3 \u05D9\u05DE\u05D9\u05DD. Pro \u05E2\u05D5\u05DC\u05D4 \u20AA59/\u05D7\u05D5\u05D3\u05E9 \u05D0\u05D5 \u20AA590/\u05E9\u05E0\u05D4." },
  { q: "\u05D4\u05D0\u05DD \u05D4\u05DE\u05D9\u05D3\u05E2 \u05E9\u05DC\u05D9 \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7?", a: "\u05DB\u05DC \u05D4\u05DE\u05D9\u05D3\u05E2 \u05DE\u05D5\u05E6\u05E4\u05DF \u05D5\u05DE\u05D0\u05D5\u05D7\u05E1\u05DF \u05D1\u05E9\u05E8\u05EA\u05D9\u05DD \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05D9\u05DD." },
  { q: "\u05D0\u05E4\u05E9\u05E8 \u05DC\u05D1\u05D8\u05DC \u05D1\u05DB\u05DC \u05E8\u05D2\u05E2?", a: "\u05DB\u05DF, \u05DC\u05DC\u05D0 \u05D4\u05EA\u05D7\u05D9\u05D9\u05D1\u05D5\u05EA \u05D5\u05DC\u05DC\u05D0 \u05E7\u05E0\u05E1\u05D5\u05EA." },
  { q: "\u05D4\u05D0\u05DD \u05D9\u05E9 \u05EA\u05DE\u05D9\u05DB\u05D4?", a: "\u05DB\u05DF, \u05EA\u05DE\u05D9\u05DB\u05D4 \u05DE\u05DC\u05D0\u05D4 \u05D1\u05DE\u05D9\u05D9\u05DC \u05D5\u05D1\u05E6\u05F3\u05D0\u05D8." },
  { q: "\u05D4\u05D0\u05DD \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA \u05E2\u05D5\u05D1\u05D3\u05EA \u05D1\u05D8\u05DC\u05E4\u05D5\u05DF?", a: "\u05DB\u05DF, Planify \u05DE\u05D5\u05EA\u05D0\u05DE\u05EA \u05DC\u05D7\u05DC\u05D5\u05D8\u05D9\u05DF \u05DC\u05DE\u05D5\u05D1\u05D9\u05D9\u05DC." },
];

const freePlanFeatures = ["3 \u05D9\u05DE\u05D9 \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF", "\u05E2\u05D3 1 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8", "\u05E2\u05D3 3 \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA"];
const proPlanFeatures = [
  "\u221E \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD",
  "\u221E \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA",
  "\u221E \u05EA\u05E1\u05E8\u05D9\u05D8\u05D9\u05DD",
  "AI",
  "\u05D0\u05E0\u05DC\u05D9\u05D8\u05D9\u05E7\u05D4",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navLinks = [
    { label: "\u05E4\u05D9\u05E6\u05F3\u05E8\u05D9\u05DD", href: "#features" },
    { label: "\u05DC\u05DE\u05D9 \u05DE\u05EA\u05D0\u05D9\u05DD", href: "#audience" },
    { label: "\u05EA\u05DE\u05D7\u05D5\u05E8", href: "#pricing" },
    { label: "\u05E9\u05D0\u05DC\u05D5\u05EA \u05E0\u05E4\u05D5\u05E6\u05D5\u05EA", href: "#faq" },
  ];

  return (
    <div dir="rtl" className="relative overflow-x-hidden text-gray-900 dark:text-gray-100">
      {/* ====== NAVBAR ====== */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-[#0a0a0a]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#38b6ff] to-[#0077cc] text-lg font-bold text-white">
              P
            </div>
            <span className="text-xl font-bold">Planify</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#38b6ff] dark:text-gray-400 dark:hover:text-[#38b6ff]"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-[#38b6ff] dark:text-gray-400"
            >
              \u05DB\u05E0\u05D9\u05E1\u05D4
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-[#38b6ff] to-[#0077cc] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#38b6ff]/25 transition-transform hover:scale-105"
            >
              \u05D4\u05EA\u05D7\u05DC \u05D1\u05D7\u05D9\u05E0\u05DD
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-gray-800 transition-transform dark:bg-gray-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-gray-800 transition-opacity dark:bg-gray-200 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-gray-800 transition-transform dark:bg-gray-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-[#0a0a0a] md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {l.label}
                </a>
              ))}
              <hr className="border-gray-200 dark:border-gray-800" />
              <Link href="/sign-in" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                \u05DB\u05E0\u05D9\u05E1\u05D4
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-gradient-to-r from-[#38b6ff] to-[#0077cc] px-5 py-2 text-center text-sm font-semibold text-white"
              >
                \u05D4\u05EA\u05D7\u05DC \u05D1\u05D7\u05D9\u05E0\u05DD
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ====== HERO ====== */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        {/* Animated blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-[#38b6ff]/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full bg-[#0077cc]/15 blur-[120px] [animation-delay:2s]" />
          <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-[#38b6ff]/10 blur-[100px] [animation-delay:4s]" />
        </div>

        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            \u05DB\u05DC \u05DE\u05D4 \u05E9\u05E2\u05E1\u05E7 \u05E7\u05E8\u05D9\u05D0\u05D9\u05D9\u05D8\u05D9\u05D1\u05D9 \u05E6\u05E8\u05D9\u05DA.{" "}
            <span className="bg-gradient-to-r from-[#38b6ff] to-[#0077cc] bg-clip-text text-transparent">
              \u05D1\u05DE\u05E7\u05D5\u05DD \u05D0\u05D7\u05D3.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
          >
            \u05E0\u05D9\u05D4\u05D5\u05DC \u05DC\u05D9\u05D3\u05D9\u05DD, \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD, \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA, \u05EA\u05D5\u05DB\u05DF \u05D5\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD &mdash; \u05D1\u05E4\u05DC\u05D8\u05E4\u05D5\u05E8\u05DE\u05D4 \u05D0\u05D7\u05EA \u05E9\u05E0\u05D1\u05E0\u05EA\u05D4 \u05D1\u05DE\u05D9\u05D5\u05D7\u05D3 \u05DC\u05E6\u05DC\u05DE\u05D9\u05DD, \u05D9\u05D5\u05E6\u05E8\u05D9 \u05EA\u05D5\u05DB\u05DF \u05D5\u05DE\u05E0\u05D4\u05DC\u05D5\u05EA \u05E1\u05D5\u05E9\u05D9\u05D0\u05DC.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="rounded-xl bg-gradient-to-r from-[#38b6ff] to-[#0077cc] px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-[#38b6ff]/30 transition-transform hover:scale-105"
            >
              \u05D4\u05EA\u05D7\u05DC \u05D1\u05D7\u05D9\u05E0\u05DD &larr;
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-gray-300 bg-white/60 px-8 py-3.5 text-base font-semibold text-gray-700 backdrop-blur-sm transition-colors hover:border-[#38b6ff] hover:text-[#38b6ff] dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300"
            >
              \u05E6\u05E4\u05D4 \u05D1\u05D3\u05DE\u05D5
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== AUDIENCE ====== */}
      <section id="audience" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            \u05DC\u05DE\u05D9 \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05EA\u05D0\u05D9\u05DE\u05D4
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <motion.div
                key={a.title}
                variants={fadeUp}
                className="group rounded-2xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/80"
              >
                <span className="text-4xl">{a.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{a.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== PAIN POINTS ====== */}
      <section className="bg-gray-50 px-4 py-20 dark:bg-gray-950 sm:px-6">
        <motion.div
          className="mx-auto max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            \u05D1\u05E2\u05D9\u05D5\u05EA \u05E9\u05D0\u05E0\u05D7\u05E0\u05D5 \u05E4\u05D5\u05EA\u05E8\u05D9\u05DD
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl border border-white/20 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-400">\u2718</span>
                  <p className="text-sm text-gray-500 line-through dark:text-gray-500">{p.before}</p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">\u2714</span>
                  <p className="text-sm font-medium">{p.after}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            \u05D4\u05DB\u05DC\u05D9\u05DD \u05E9\u05EA\u05E7\u05D1\u05DC\u05D5
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-xl text-center text-gray-600 dark:text-gray-400">
            \u05DB\u05DC \u05DE\u05D4 \u05E9\u05E6\u05E8\u05D9\u05DA \u05DC\u05E0\u05D4\u05DC \u05D0\u05EA \u05D4\u05E2\u05E1\u05E7, \u05D1\u05DE\u05E7\u05D5\u05DD \u05D0\u05D7\u05D3.
          </motion.p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group rounded-2xl border border-white/20 bg-white/80 p-6 backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/80"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="bg-gray-50 px-4 py-20 dark:bg-gray-950 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            \u05D0\u05D9\u05DA \u05D6\u05D4 \u05E2\u05D5\u05D1\u05D3
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#38b6ff] to-[#0077cc] text-xl font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="pricing" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            \u05EA\u05DE\u05D7\u05D5\u05E8
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Free */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-white/20 bg-white/80 p-8 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
            >
              <h3 className="text-xl font-bold">\u05D7\u05D9\u05E0\u05DE\u05D9</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">\u20AA0</span>
              </div>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-emerald-500">\u2713</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block rounded-xl border border-gray-300 py-3 text-center text-sm font-semibold transition-colors hover:border-[#38b6ff] hover:text-[#38b6ff] dark:border-gray-700"
              >
                \u05D4\u05EA\u05D7\u05DC \u05D1\u05D7\u05D9\u05E0\u05DD
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col rounded-2xl border-2 border-[#38b6ff] bg-white/80 p-8 shadow-xl shadow-[#38b6ff]/10 backdrop-blur-sm dark:bg-gray-900/80"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#0077cc] px-4 py-1 text-xs font-bold text-white">
                \u05D4\u05DB\u05D9 \u05E4\u05D5\u05E4\u05D5\u05DC\u05E8\u05D9
              </span>
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">\u20AA59</span>
                <span className="text-sm text-gray-500">/\u05D7\u05D5\u05D3\u05E9</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">\u05D4\u05DB\u05DC \u05DC\u05DC\u05D0 \u05D4\u05D2\u05D1\u05DC\u05D4</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {proPlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-[#38b6ff]">\u2713</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block rounded-xl bg-gradient-to-r from-[#38b6ff] to-[#0077cc] py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#38b6ff]/25 transition-transform hover:scale-105"
              >
                \u05E9\u05D3\u05E8\u05D2 \u05DC-Pro
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className="bg-gray-50 px-4 py-20 dark:bg-gray-950 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            \u05E9\u05D0\u05DC\u05D5\u05EA \u05E0\u05E4\u05D5\u05E6\u05D5\u05EA
          </motion.h2>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl border border-white/20 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-right"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span
                    className={`mr-auto text-xl text-gray-400 transition-transform ${openFaq === i ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="px-4 py-24 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            \u05DE\u05D5\u05DB\u05E0\u05D9\u05DD \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            \u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05D0\u05DC\u05E4\u05D9 \u05E7\u05E8\u05D9\u05D0\u05D9\u05D9\u05D8\u05D9\u05D1\u05D9\u05DD \u05E9\u05DB\u05D1\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05D0\u05EA \u05D4\u05E2\u05E1\u05E7 \u05E9\u05DC\u05D4\u05DD \u05E2\u05DD Planify.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/sign-up"
              className="inline-block rounded-xl bg-gradient-to-r from-[#38b6ff] to-[#0077cc] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#38b6ff]/30 transition-transform hover:scale-105"
            >
              \u05D4\u05EA\u05D7\u05DC \u05D1\u05D7\u05D9\u05E0\u05DD &larr;
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#38b6ff] to-[#0077cc] text-sm font-bold text-white">
                P
              </div>
              <span className="text-lg font-bold">Planify</span>
            </div>
            <p className="text-xs text-gray-500">\u05D4\u05DB\u05DC\u05D9 \u05D4\u05D7\u05DB\u05DD \u05DC\u05E0\u05D9\u05D4\u05D5\u05DC \u05D4\u05E2\u05E1\u05E7 \u05D4\u05E7\u05E8\u05D9\u05D0\u05D9\u05D9\u05D8\u05D9\u05D1\u05D9 \u05E9\u05DC\u05DA</p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="transition-colors hover:text-[#38b6ff]">\u05EA\u05E0\u05D0\u05D9 \u05E9\u05D9\u05DE\u05D5\u05E9</a>
            <a href="#" className="transition-colors hover:text-[#38b6ff]">\u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA \u05E4\u05E8\u05D8\u05D9\u05D5\u05EA</a>
            <a href="#" className="transition-colors hover:text-[#38b6ff]">\u05D9\u05E6\u05D9\u05E8\u05EA \u05E7\u05E9\u05E8</a>
          </div>

          {/* Social placeholder + copyright */}
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex gap-3">
              {/* Social icon placeholders */}
              {["M", "X", "I"].map((s) => (
                <span
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">&copy; 2026 Planify</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
