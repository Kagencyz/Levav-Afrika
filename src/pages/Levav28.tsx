import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LEVAV28_DAYS,
  getLevav28Progress,
  saveLevav28TaskCompletion,
  getCurrentDay,
  setCurrentDay,
  isDayUnlocked,
  isDayCompleted,
} from "@/lib/levavData";
import type { Levav28Day, Levav28Task } from "@/lib/levavData";

/* ------------------------------------------------------------------ */
/*  PHASE CONFIGURATION                                                */
/* ------------------------------------------------------------------ */

interface PhaseConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  days: [number, number];
}

const PHASES: Record<string, PhaseConfig> = {
  CONFRONT: {
    label: "CONFRONT",
    color: "#EF4444",
    bg: "bg-red-500",
    border: "border-red-500",
    glow: "shadow-red-500/20",
    days: [1, 7],
  },
  DISSECT: {
    label: "DISSECT",
    color: "#F59E0B",
    bg: "bg-amber-500",
    border: "border-amber-500",
    glow: "shadow-amber-500/20",
    days: [8, 14],
  },
  OWN: {
    label: "OWN",
    color: "#3B82F6",
    bg: "bg-blue-500",
    border: "border-blue-500",
    glow: "shadow-blue-500/20",
    days: [15, 21],
  },
  EXECUTE: {
    label: "EXECUTE",
    color: "#C6FF34",
    bg: "bg-[#C6FF34]",
    border: "border-[#C6FF34]",
    glow: "shadow-[#C6FF34]/20",
    days: [22, 28],
  },
};

function getPhaseForDay(dayNumber: number): PhaseConfig {
  if (dayNumber <= 7) return PHASES.CONFRONT;
  if (dayNumber <= 14) return PHASES.DISSECT;
  if (dayNumber <= 21) return PHASES.OWN;
  return PHASES.EXECUTE;
}

/* ------------------------------------------------------------------ */
/*  MINI HELPERS                                                       */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

/** ---- Phase Badge ------------------------------------------------ */
function PhaseBadge({ dayNumber }: { dayNumber: number }) {
  const phase = getPhaseForDay(dayNumber);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border",
        phase.border
      )}
      style={{ color: phase.color, borderColor: phase.color }}
    >
      {phase.label}
    </span>
  );
}

/** ---- Confetti Particle ------------------------------------------ */
function ConfettiPiece({
  delay,
  x,
  color,
}: {
  delay: number;
  x: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: "30%" }}
      initial={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        y: [0, -200 - Math.random() * 300, 400 + Math.random() * 200],
        x: [0, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 200],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
        rotate: [0, 360, 720],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

/** ---- Confetti Celebration --------------------------------------- */
function ConfettiCelebration({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = ["#C6FF34", "#7E3BED", "#3B82F6", "#EF4444", "#F59E0B", "#EC4899"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.8,
    x: 10 + Math.random() * 80,
    color: colors[i % colors.length],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}
    </div>
  );
}

/** ---- Completion Modal (Day 28) ---------------------------------- */
function CompletionModal({
  open,
  stats,
  onClose,
}: {
  open: boolean;
  stats: { daysCompleted: number; tasksCompleted: number };
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#C6FF34]/30 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center"
            initial={{ scale: 0.6, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 150 }}
          >
            {/* Glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C6FF34]/20 via-[#7E3BED]/20 to-[#C6FF34]/20 rounded-3xl blur-xl opacity-50" />

            <div className="relative">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(198,255,52,0.3)",
                    "0 0 60px rgba(198,255,52,0.5)",
                    "0 0 20px rgba(198,255,52,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg
                  className="w-12 h-12 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                You are a Levav Graduate!
              </h2>
              <p className="text-white/50 mb-8">
                28 days of transformation. One unstoppable you.
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <p className="text-3xl font-black text-[#C6FF34]">
                    {stats.daysCompleted}/28
                  </p>
                  <p className="text-white/40 text-sm">Days Completed</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <p className="text-3xl font-black text-[#7E3BED]">
                    {stats.tasksCompleted}/84
                  </p>
                  <p className="text-white/40 text-sm">Tasks Crushed</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    alert("Certificate download coming soon!");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C6FF34] to-[#a8e600] text-black font-bold hover:from-[#d4ff5c] hover:to-[#b8f030] transition-all"
                >
                  Download Certificate
                </button>
                <Link
                  to="/opportunities"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-semibold hover:bg-white/[0.1] transition-all text-center block"
                >
                  Continue Your Journey →
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function Levav28() {
  /* ---- state ---- */
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentDay());
  const [progress, setProgress] = useState(getLevav28Progress());
  const [taskTick, setTaskTick] = useState(0); // force re-render on task toggle
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [justCompletedTask, setJustCompletedTask] = useState<string | null>(
    null
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  /* ---- derived ---- */
  const currentDay = useMemo(() => getCurrentDay(), [selectedDay, taskTick]);

  const activeDayData: Levav28Day | undefined = useMemo(
    () => LEVAV28_DAYS.find((d) => d.day === selectedDay),
    [selectedDay]
  );

  const phase = useMemo(
    () => getPhaseForDay(selectedDay),
    [selectedDay]
  );

  const allDaysCompleted = useMemo(() => {
    return LEVAV28_DAYS.every((d) => isDayCompleted(d.day));
  }, [taskTick, progress]);

  const stats = useMemo(() => {
    const daysCompleted = LEVAV28_DAYS.filter((d) =>
      isDayCompleted(d.day)
    ).length;
    const tasksCompleted = LEVAV28_DAYS.reduce((acc, d) => {
      const dayProg = progress[d.day] || {};
      return (
        acc + d.tasks.filter((t) => dayProg[t.id]?.completed).length
      );
    }, 0);
    const currentPhase =
      daysCompleted < 7
        ? "CONFRONT"
        : daysCompleted < 14
        ? "DISSECT"
        : daysCompleted < 21
        ? "OWN"
        : "EXECUTE";
    return { daysCompleted, tasksCompleted, currentPhase };
  }, [progress, taskTick]);

  const progressPercent = useMemo(
    () => (stats.daysCompleted / 28) * 100,
    [stats.daysCompleted]
  );

  /* ---- check day 28 completion ---- */
  useEffect(() => {
    if (isDayCompleted(28) && !showCompletionModal) {
      setTimeout(() => {
        setConfettiActive(true);
        setShowCompletionModal(true);
        setTimeout(() => setConfettiActive(false), 4000);
      }, 600);
    }
  }, [taskTick, progress]);

  /* ---- handlers ---- */
  const handleSelectDay = useCallback(
    (day: number) => {
      if (!isDayUnlocked(day)) return;
      setSelectedDay(day);
      setCurrentDay(day);
    },
    []
  );

  const handleTaskToggle = useCallback(
    (day: number, taskId: string, completed: boolean) => {
      saveLevav28TaskCompletion(day, taskId, completed);
      setProgress(getLevav28Progress());
      setTaskTick((t) => t + 1);

      if (completed) {
        setJustCompletedTask(taskId);
        setTimeout(() => setJustCompletedTask(null), 1200);
      }

    },
    []
  );

  /* ---- day navigation scroll ref ---- */
  const scrollRef = React.useRef<HTMLDivElement>(null);

  /* ---- scroll selected day into view ---- */
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-day="${selectedDay}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDay]);

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <ConfettiCelebration active={confettiActive} />

      <CompletionModal
        open={showCompletionModal}
        stats={stats}
        onClose={() => setShowCompletionModal(false)}
      />

      {/* ============================================================ */}
      {/*  1. HERO SECTION                                               */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-8 px-4 md:px-8">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#7E3BED]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] text-xs font-bold tracking-wider uppercase mb-6">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Transformation Program
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3">
              <span className="text-white">Levav</span>{" "}
              <span className="text-[#C6FF34]">28™</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-lg mx-auto">
              28 days. One transformed professional.
            </p>
          </motion.div>

          {/* Phase Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 max-w-3xl mx-auto">
              {Object.entries(PHASES).map(([key, p], idx) => {
                const isActive =
                  selectedDay >= p.days[0] && selectedDay <= p.days[1];
                const isPast = selectedDay > p.days[1];
                return (
                  <React.Fragment key={key}>
                    <div
                      className={cn(
                        "flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300",
                        isActive
                          ? "bg-white/[0.05] border-white/10"
                          : "bg-transparent border-white/[0.04] opacity-50"
                      )}
                    >
                      {/* Phase dot */}
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: isPast || isActive ? p.color : "#333",
                          boxShadow:
                            isActive ? `0 0 12px ${p.color}40` : "none",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-bold tracking-wider"
                          style={{
                            color: isActive || isPast ? p.color : "#555",
                          }}
                        >
                          {p.label}
                        </p>
                        <p className="text-[10px] text-white/30">
                          Days {p.days[0]}-{p.days[1]}
                        </p>
                      </div>
                      {(isPast || (isActive && isDayCompleted(p.days[1]))) && (
                        <svg
                          className="w-4 h-4 shrink-0"
                          style={{ color: p.color }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    {idx < 3 && (
                      <div className="hidden md:block w-6 h-px bg-white/10 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>

          {/* Current day + overall progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 md:p-6 max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <p className="text-white/40 text-sm mb-1">Current Progress</p>
                <p className="text-2xl font-bold text-white">
                  You are on{" "}
                  <span className="text-[#C6FF34]">Day {currentDay}</span> of
                  28
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">
                  {Math.round(progressPercent)}%
                </p>
                <p className="text-white/40 text-sm">Complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #EF4444 0%, #F59E0B 25%, #3B82F6 50%, #C6FF34 100%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-wider">
              <span>Day 1</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day 28</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  2. DAY NAVIGATION                                             */}
      {/* ============================================================ */}
      <section className="px-4 md:px-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            style={{ scrollbarWidth: "thin" }}
          >
            {LEVAV28_DAYS.map((day) => {
              const unlocked = isDayUnlocked(day.day);
              const completed = isDayCompleted(day.day);
              const isCurrent = day.day === selectedDay;
              const dayPhase = getPhaseForDay(day.day);

              return (
                <motion.button
                  key={day.day}
                  data-day={day.day}
                  onClick={() => handleSelectDay(day.day)}
                  disabled={!unlocked}
                  whileHover={unlocked ? { scale: 1.05 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  className={cn(
                    "relative flex-shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                    isCurrent
                      ? "bg-white/[0.08] border-[#C6FF34] shadow-[0_0_20px_rgba(198,255,52,0.15)]"
                      : completed
                      ? "bg-white/[0.04] border-white/10"
                      : unlocked
                      ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                      : "bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed"
                  )}
                >
                  {/* Phase color indicator (top edge) */}
                  <div
                    className="absolute top-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        completed || isCurrent ? dayPhase.color : "transparent",
                    }}
                  />

                  {completed ? (
                    <svg
                      className="w-4 h-4"
                      style={{ color: dayPhase.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : !unlocked ? (
                    <svg
                      className="w-3.5 h-3.5 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ) : (
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: isCurrent ? "#C6FF34" : "#555",
                      }}
                    >
                      {dayPhase.label[0]}
                    </span>
                  )}

                  <span
                    className={cn(
                      "text-sm font-bold",
                      isCurrent
                        ? "text-[#C6FF34]"
                        : completed
                        ? "text-white/70"
                        : unlocked
                        ? "text-white/50"
                        : "text-white/20"
                    )}
                  >
                    {day.day}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. ACTIVE DAY CARD  +  5. SIDEBAR                             */}
      {/* ============================================================ */}
      <section className="px-4 md:px-8 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* ---- Main day card ---- */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeDayData && (
                <motion.div
                  key={activeDayData.day}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
                >
                  {/* Day header */}
                  <div
                    className="relative px-6 py-8 md:px-10 md:py-10"
                    style={{
                      background: `linear-gradient(135deg, ${phase.color}08 0%, transparent 60%)`,
                    }}
                  >
                    {/* Phase-colored top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, ${phase.color}, transparent)`,
                      }}
                    />

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="text-5xl md:text-6xl font-black"
                            style={{ color: phase.color }}
                          >
                            {String(activeDayData.day).padStart(2, "0")}
                          </span>
                          <PhaseBadge dayNumber={activeDayData.day} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                          {activeDayData.title}
                        </h2>
                        {activeDayData.subtitle && (
                          <p className="text-white/50 text-base">
                            {activeDayData.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Day status icon */}
                      <div className="shrink-0">
                        {isDayCompleted(activeDayData.day) ? (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${phase.color}15`,
                              border: `2px solid ${phase.color}40`,
                            }}
                          >
                            <svg
                              className="w-7 h-7"
                              style={{ color: phase.color }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/10"
                            style={{
                              boxShadow: `0 0 20px ${phase.color}10`,
                            }}
                          >
                            <span
                              className="text-lg font-black"
                              style={{ color: phase.color }}
                            >
                              {activeDayData.day}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quote */}
                    {activeDayData.quote && (
                      <blockquote className="border-l-2 border-white/10 pl-4 py-1">
                        <p className="text-white/40 italic text-sm">
                          "{activeDayData.quote}"
                        </p>
                      </blockquote>
                    )}
                  </div>

                  {/* Task list */}
                  <div className="px-6 md:px-10 pb-8">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">
                      Today&apos;s Challenges
                    </h3>
                    <div className="space-y-3">
                      {activeDayData.tasks.map((task, idx) => {
                        const isCompleted = !!(
                          progress[activeDayData.day]?.[task.id]?.completed
                        );
                        const justDone = justCompletedTask === task.id;

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: justDone ? [1, 1.02, 1] : 1,
                            }}
                            transition={{
                              opacity: { delay: idx * 0.08 },
                              x: { delay: idx * 0.08 },
                              scale: justDone
                                ? { duration: 0.4, ease: "easeOut" }
                                : undefined,
                            }}
                            className={cn(
                              "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                              isCompleted
                                ? "bg-white/[0.02] border-white/[0.04]"
                                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                            )}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() =>
                                handleTaskToggle(
                                  activeDayData.day,
                                  task.id,
                                  !isCompleted
                                )
                              }
                              className={cn(
                                "mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                                isCompleted
                                  ? "border-[#C6FF34] bg-[#C6FF34]"
                                  : "border-white/20 hover:border-[#C6FF34]/50"
                              )}
                            >
                              <AnimatePresence>
                                {isCompleted && (
                                  <motion.svg
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="w-4 h-4 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </motion.svg>
                                )}
                              </AnimatePresence>
                            </button>

                            {/* Task content */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-semibold text-sm transition-all",
                                  isCompleted
                                    ? "text-white/40 line-through"
                                    : "text-white"
                                )}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p
                                  className={cn(
                                    "text-sm mt-0.5 transition-all",
                                    isCompleted
                                      ? "text-white/20"
                                      : "text-white/40"
                                  )}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Action link */}
                            {task.actionUrl && !isCompleted && (
                              <Link
                                to={task.actionUrl}
                                className={cn(
                                  "shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                  "bg-white/[0.05] border border-white/10 text-white/70 hover:bg-[#C6FF34] hover:text-black hover:border-[#C6FF34]"
                                )}
                              >
                                Go →
                              </Link>
                            )}

                            {/* Completion sparkle */}
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="shrink-0"
                              >
                                <svg
                                  className="w-5 h-5 text-[#C6FF34]"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Day completion status */}
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-white/30">
                        {
                          activeDayData.tasks.filter(
                            (t) =>
                              progress[activeDayData.day]?.[t.id]?.completed
                          ).length
                        }{" "}
                        of {activeDayData.tasks.length} tasks completed
                      </p>
                      {isDayCompleted(activeDayData.day) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] text-xs font-bold"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Day Complete
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Day footer with navigation */}
                  <div className="px-6 md:px-10 py-4 border-t border-white/[0.04] flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (selectedDay > 1) handleSelectDay(selectedDay - 1);
                      }}
                      disabled={selectedDay <= 1}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        selectedDay > 1
                          ? "text-white/40 hover:text-white"
                          : "text-white/10 cursor-not-allowed"
                      )}
                    >
                      ← Previous Day
                    </button>

                    <div className="flex items-center gap-1">
                      {activeDayData.tasks.map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            progress[activeDayData.day]?.[t.id]?.completed
                              ? "bg-[#C6FF34]"
                              : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (selectedDay < 28) handleSelectDay(selectedDay + 1);
                      }}
                      disabled={
                        selectedDay >= 28 || !isDayUnlocked(selectedDay + 1)
                      }
                      className={cn(
                        "text-sm font-medium transition-colors",
                        selectedDay < 28 && isDayUnlocked(selectedDay + 1)
                          ? "text-white/40 hover:text-white"
                          : "text-white/10 cursor-not-allowed"
                      )}
                    >
                      Next Day →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ---- Progress Sidebar (desktop) ---- */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Overall stats card */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">
                  Your Journey
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Days Done</span>
                    <span className="text-lg font-bold text-white">
                      {stats.daysCompleted}
                      <span className="text-white/30">/28</span>
                    </span>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Tasks Crushed</span>
                    <span className="text-lg font-bold text-white">
                      {stats.tasksCompleted}
                      <span className="text-white/30">/84</span>
                    </span>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Current Phase</span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: PHASES[stats.currentPhase]?.color || "#fff",
                      }}
                    >
                      {stats.currentPhase}
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivation card */}
              <div
                className="rounded-2xl p-5 border"
                style={{
                  background: `linear-gradient(135deg, ${phase.color}08, transparent)`,
                  borderColor: `${phase.color}15`,
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: phase.color }}>
                  {phase.label} Phase
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {phase.label === "CONFRONT" &&
                    "Face your reality head-on. No filters, no excuses."}
                  {phase.label === "DISSECT" &&
                    "Break it all down. Understand every piece."}
                  {phase.label === "OWN" &&
                    "Take full ownership of your path forward."}
                  {phase.label === "EXECUTE" &&
                    "Make it happen. Every action counts."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5b. MOBILE BOTTOM SHEET                                       */}
      {/* ============================================================ */}
      <div className="lg:hidden">
        {/* Toggle button */}
        <button
          onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C6FF34] text-black flex items-center justify-center shadow-lg shadow-[#C6FF34]/20"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileSheetOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            )}
          </svg>
        </button>

        {/* Sheet */}
        <AnimatePresence>
          {mobileSheetOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setMobileSheetOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-white/[0.06] rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <h3 className="text-lg font-bold text-white mb-4">
                  Your Journey
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-[#C6FF34]">
                      {stats.daysCompleted}
                      <span className="text-white/30">/28</span>
                    </p>
                    <p className="text-white/40 text-xs mt-1">Days Done</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-[#7E3BED]">
                      {stats.tasksCompleted}
                      <span className="text-white/30">/84</span>
                    </p>
                    <p className="text-white/40 text-xs mt-1">Tasks Crushed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 py-3 border-y border-white/[0.04]">
                  <span className="text-sm text-white/50">Current Phase</span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: PHASES[stats.currentPhase]?.color || "#fff",
                    }}
                  >
                    {stats.currentPhase}
                  </span>
                </div>

                {/* Motivation */}
                <div
                  className="mt-4 rounded-xl p-4 border"
                  style={{
                    background: `linear-gradient(135deg, ${phase.color}08, transparent)`,
                    borderColor: `${phase.color}15`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: phase.color }}
                  >
                    {phase.label}
                  </p>
                  <p className="text-xs text-white/50">
                    {phase.label === "CONFRONT" &&
                      "Face your reality head-on."}
                    {phase.label === "DISSECT" && "Break it all down."}
                    {phase.label === "OWN" && "Take full ownership."}
                    {phase.label === "EXECUTE" && "Make it happen."}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/*  6. COMPLETION BANNER (shown when all 28 days done)            */}
      {/* ============================================================ */}
      {allDaysCompleted && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-8 pb-20"
        >
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-r from-[#C6FF34]/10 via-[#7E3BED]/10 to-[#C6FF34]/10 border border-[#C6FF34]/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[#C6FF34]/5" />
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  🎓
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                  Levav 28™ Graduate
                </h2>
                <p className="text-white/50 max-w-md mx-auto mb-6">
                  You have completed all 28 days of transformation. Your
                  professional journey has been forever changed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="px-8 py-3.5 rounded-xl bg-[#C6FF34] text-black font-bold hover:bg-[#d4ff5c] transition-colors"
                  >
                    View Certificate
                  </button>
                  <Link
                    to="/opportunities"
                    className="px-8 py-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-semibold hover:bg-white/[0.1] transition-all"
                  >
                    Explore Opportunities →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
