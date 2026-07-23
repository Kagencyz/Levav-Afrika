import React from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Code,
  CheckCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Users,
  Play,
  Award,
  ChevronRight,
  Star,
  GraduationCap,
  Trophy,
  X,
} from "lucide-react";
import {
  LEARN_COURSES,
  getLearnProgress,
  saveLessonCompletion,
  enrollInCourse,
  awardWriPoints,
} from "@/lib/levavData";
import type { LearnCourse, LearnLesson } from "@/lib/levavData";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type ViewState = { type: "catalog" } | { type: "course"; courseId: string } | { type: "lesson"; courseId: string; lessonId: string };

interface Toast {
  id: string;
  message: string;
  subMessage?: string;
  type: "success" | "courseComplete";
}

/* ═══════════════════════════════════════════════════════════════
   CHAMPIONS DATA
   ═══════════════════════════════════════════════════════════════ */
const CHAMPIONS = [
  {
    name: "Dr. Amina Okafor",
    role: "Leadership Coach",
    initials: "AO",
    color: "#C6FF34",
    courseId: "prof-dev-101",
  },
  {
    name: "Amara Nwosu",
    role: "Senior UX Designer",
    initials: "AN",
    color: "#7E3BED",
    courseId: "ux-design-101",
  },
  {
    name: "Zara Mensah",
    role: "Data Scientist",
    initials: "ZM",
    color: "#C6FF34",
    courseId: "data-science-101",
  },
  {
    name: "Kofi Asante",
    role: "Executive Coach",
    initials: "KA",
    color: "#7E3BED",
    courseId: "champion-leadership",
  },
  {
    name: "Tendai Moyo",
    role: "Senior Developer",
    initials: "TM",
    color: "#C6FF34",
    courseId: "web-dev-101",
  },
];

/* ═══════════════════════════════════════════════════════════════
   ENROLLED COUNTS (simulated)
   ═══════════════════════════════════════════════════════════════ */
const ENROLLED_COUNTS: Record<string, number> = {
  "prof-dev-101": 487,
  "ux-design-101": 352,
  "data-science-101": 298,
  "champion-leadership": 541,
  "web-dev-101": 724,
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY COLORS
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_COLORS: Record<string, string> = {
  "Professional Development": "#C6FF34",
  "Skills Development": "#7E3BED",
  "Leadership Training": "#3B82F6",
};

/* ═══════════════════════════════════════════════════════════════
   LESSON TYPE CONFIG
   ═══════════════════════════════════════════════════════════════ */
const LESSON_TYPE_CONFIG: Record<
  string,
  { icon: typeof Video; label: string; color: string }
> = {
  video: { icon: Video, label: "Video", color: "#C6FF34" },
  article: { icon: FileText, label: "Article", color: "#7E3BED" },
  quiz: { icon: HelpCircle, label: "Quiz", color: "#3B82F6" },
  project: { icon: Code, label: "Project", color: "#F59E0B" },
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY: Get course progress from localStorage
   ═══════════════════════════════════════════════════════════════ */
function getCourseProgress(courseId: string) {
  const all = getLearnProgress();
  return all[courseId] || { enrolled: false, completed: false, progress: 0, lessonProgress: {} };
}

function isLessonCompleted(courseId: string, lessonId: string) {
  const p = getCourseProgress(courseId);
  return !!p.lessonProgress[lessonId];
}

function isLessonUnlocked(courseId: string, lessonIndex: number) {
  if (lessonIndex === 0) return true;
  const course = LEARN_COURSES.find((c) => c.id === courseId);
  if (!course) return false;
  const prevLesson = course.lessons[lessonIndex - 1];
  return isLessonCompleted(courseId, prevLesson.id);
}

/* ═══════════════════════════════════════════════════════════════
   GRADIENT PLACEHOLDER for course thumbnail
   ═══════════════════════════════════════════════════════════════ */
function CourseThumbnail({
  letter,
  color,
}: {
  letter: string;
  color: string;
}) {
  return (
    <div
      className="w-full h-40 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}08 50%, #1a1a2e 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${color}40 0%, transparent 60%)`,
        }}
      />
      <span
        className="text-5xl font-bold relative z-10 select-none"
        style={{ color: `${color}99` }}
      >
        {letter}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CELEBRATION TOAST
   ═══════════════════════════════════════════════════════════════ */
function CelebrationToast({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-6 right-6 z-50"
    >
      <div
        className="rounded-2xl px-6 py-4 flex items-start gap-4 min-w-[320px] border"
        style={{
          background: toast.type === "courseComplete" ? "linear-gradient(135deg, #C6FF34 0%, #7E3BED 100%)" : "#1a1a1a",
          borderColor: toast.type === "courseComplete" ? "#C6FF34" : "#C6FF3444",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: toast.type === "courseComplete" ? "rgba(0,0,0,0.3)" : "#C6FF3422",
          }}
        >
          {toast.type === "courseComplete" ? (
            <Trophy className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-5 h-5 text-[#C6FF34]" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`font-semibold text-sm ${toast.type === "courseComplete" ? "text-white" : "text-[#C6FF34]"}`}
          >
            {toast.message}
          </p>
          {toast.subMessage && (
            <p
              className={`text-xs mt-0.5 ${toast.type === "courseComplete" ? "text-white/80" : "text-[#A0A0A0]"}`}
            >
              {toast.subMessage}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X
            className={`w-4 h-4 ${toast.type === "courseComplete" ? "text-white" : "text-[#A0A0A0]"}`}
          />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 1 — CATALOG
   ═══════════════════════════════════════════════════════════════ */
function CatalogView({
  onSelectCourse,
  onSelectChampionCourse,
}: {
  onSelectCourse: (courseId: string) => void;
  onSelectChampionCourse: (courseId: string) => void;
}) {
  const totalLessons = React.useMemo(
    () => LEARN_COURSES.reduce((acc, c) => acc + c.lessons.length, 0),
    []
  );
  const totalEnrolled = React.useMemo(
    () => Object.values(ENROLLED_COUNTS).reduce((a, b) => a + b, 0),
    []
  );

  return (
    <motion.div
      key="catalog"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ─── Hero ─── */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-black pt-20">
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7E3BED]/10 border border-[#7E3BED]/20 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <Sparkles className="w-4 h-4 text-[#7E3BED]" />
            <span className="text-[#7E3BED] text-sm font-medium">Learning</span>
          </motion.div>

          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            Learn for{" "}
            <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
              Transformation
            </span>
          </motion.h1>

          <motion.p
            className="text-[#A0A0A0] text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.19, 1, 0.22, 1] }}
          >
            Knowledge is the foundation of transformation. Explore courses from Levav Champions
            and build skills that move your career forward.
          </motion.p>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-[#0A0A0A] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { value: `${LEARN_COURSES.length}`, label: "Courses", icon: BookOpen },
              { value: `${totalLessons}+`, label: "Lessons", icon: GraduationCap },
              { value: `${CHAMPIONS.length}`, label: "Champions", icon: Star },
              { value: `${totalEnrolled.toLocaleString()}+`, label: "Enrolled", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-4"
                variants={fadeUp}
                custom={i}
              >
                <div className="w-12 h-12 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-[#C6FF34]" />
                </div>
                <div>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                  <p className="text-[#666666] text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Champions Section ─── */}
      <section className="bg-[#0A0A0A] py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-3 block">
              Levav Champions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
              Learn from the{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Best
              </span>
            </h2>
            <p className="text-[#A0A0A0] max-w-xl mx-auto mb-6">
              Our Champions are industry leaders who create courses and share their expertise.
            </p>
            <Link
              to="/champion-apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)] text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Apply to Become a Champion
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {CHAMPIONS.map((champion, i) => (
              <motion.div
                key={champion.name}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 text-center hover:border-white/[0.12] transition-all group"
                variants={fadeUp}
                custom={i}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${champion.color}22, ${champion.color}08)`,
                    color: champion.color,
                    border: `2px solid ${champion.color}33`,
                  }}
                >
                  {champion.initials}
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{champion.name}</h3>
                <p className="text-[#666666] text-xs mb-4">{champion.role}</p>
                <button
                  onClick={() => onSelectChampionCourse(champion.courseId)}
                  className="text-xs font-medium px-4 py-2 rounded-lg border transition-all w-full"
                  style={{
                    borderColor: `${champion.color}44`,
                    color: champion.color,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = `${champion.color}22`;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  View Content
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Course Grid ─── */}
      <section className="bg-black py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#7E3BED] text-sm font-medium tracking-wider uppercase mb-3 block">
              All Courses
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
              Start Your{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-[#A0A0A0] max-w-xl mx-auto">
              Enroll in any course and begin building your skills today. Every lesson completed earns WRI points.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {LEARN_COURSES.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onSelect={() => onSelectCourse(course.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COURSE CARD
   ═══════════════════════════════════════════════════════════════ */
function CourseCard({
  course,
  index,
  onSelect,
}: {
  course: LearnCourse;
  index: number;
  onSelect: () => void;
}) {
  const progress = getCourseProgress(course.id);
  const enrolled = progress.enrolled;
  const enrolledCount = ENROLLED_COUNTS[course.id] || 0;
  const categoryColor = CATEGORY_COLORS[course.category] || "#C6FF34";

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all group cursor-pointer"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index}
      onClick={onSelect}
    >
      <CourseThumbnail letter={course.title[0]} color={categoryColor} />

      <div className="p-6">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
            }}
          >
            {course.category}
          </span>
          <span className="text-[#666666] text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </span>
        </div>

        {/* Title & description */}
        <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-[#C6FF34] transition-colors">
          {course.title}
        </h3>
        <p className="text-[#A0A0A0] text-sm leading-relaxed mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: `linear-gradient(135deg, #7E3BED33, #7E3BED11)`,
              color: "#7E3BED",
            }}
          >
            {course.instructor
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <span className="text-[#A0A0A0] text-xs">{course.instructor}</span>
          <span className="text-[#7E3BED] text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7E3BED]/10 border border-[#7E3BED]/20">
            Levav Champion
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#666666] text-xs">
            {course.lessons.length} lessons
          </span>
          <span className="text-[#666666] text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {enrolledCount.toLocaleString()} enrolled
          </span>
        </div>

        {/* Progress bar (if enrolled) */}
        {enrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#A0A0A0]">Progress</span>
              <span className="text-[#C6FF34] font-medium">{progress.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06]">
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: "#C6FF34" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!enrolled) {
              enrollInCourse(course.id);
              onSelect();
            } else {
              onSelect();
            }
          }}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            enrolled
              ? "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 hover:bg-[#C6FF34]/20"
              : "bg-[#C6FF34] text-black hover:bg-[#d4ff5c]"
          }`}
        >
          {enrolled ? (
            <>
              <Play className="w-4 h-4" />
              Continue
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              Enroll
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 2 — COURSE DETAIL
   ═══════════════════════════════════════════════════════════════ */
function CourseDetailView({
  courseId,
  onBack,
  onSelectLesson,
}: {
  courseId: string;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}) {
  const course = React.useMemo(
    () => LEARN_COURSES.find((c) => c.id === courseId)!,
    [courseId]
  );
  const progress = getCourseProgress(courseId);
  const categoryColor = CATEGORY_COLORS[course.category] || "#C6FF34";

  if (!course) return null;

  return (
    <motion.div
      key="course-detail"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ─── Course Header ─── */}
      <section className="relative bg-black pt-24 pb-12 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: `radial-gradient(circle, ${categoryColor} 0%, transparent 70%)` }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#A0A0A0] text-sm mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Thumbnail */}
            <motion.div
              className="w-full lg:w-64 h-40 rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}08, #1a1a2e)`,
              }}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
            >
              <span className="text-6xl font-bold" style={{ color: `${categoryColor}88` }}>
                {course.title[0]}
              </span>
            </motion.div>

            {/* Info */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
                >
                  {course.category}
                </span>
                <span className="text-[#666666] text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-white mb-3">
                {course.title}
              </h1>
              <p className="text-[#A0A0A0] text-base leading-relaxed mb-4 max-w-2xl">
                {course.description}
              </p>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: `linear-gradient(135deg, #7E3BED33, #7E3BED11)`,
                    color: "#7E3BED",
                    border: "2px solid #7E3BED33",
                  }}
                >
                  {course.instructor
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{course.instructor}</p>
                  <p className="text-[#666666] text-xs">{course.instructorRole}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Progress Section ─── */}
      <section className="bg-[#0A0A0A] border-y border-white/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Course Progress</span>
            <span className="text-[#C6FF34] font-bold text-lg">{progress.progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/[0.06]">
            <motion.div
              className="h-3 rounded-full relative"
              style={{ backgroundColor: "#C6FF34" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            >
              {progress.progress > 0 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg" />
              )}
            </motion.div>
          </div>
          <p className="text-[#666666] text-xs mt-2">
            {Object.values(progress.lessonProgress).filter(Boolean).length} of{" "}
            {course.lessons.length} lessons completed
          </p>
        </div>
      </section>

      {/* ─── Lesson List ─── */}
      <section className="bg-black py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            className="text-white text-2xl font-semibold mb-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BookOpen className="w-5 h-5 text-[#C6FF34]" />
            Course Content
          </motion.h2>

          <div className="space-y-3">
            {course.lessons.map((lesson, i) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                courseId={courseId}
                onStart={() => onSelectLesson(lesson.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Certificate Preview ─── */}
      <section className="bg-[#0A0A0A] py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className={`rounded-2xl border p-8 text-center ${
              progress.progress === 100
                ? "bg-[#C6FF34]/5 border-[#C6FF34]/30"
                : "bg-white/[0.02] border-white/[0.06] opacity-60"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                progress.progress === 100 ? "bg-[#C6FF34]/20" : "bg-white/[0.06]"
              }`}
            >
              <Award
                className={`w-8 h-8 ${
                  progress.progress === 100 ? "text-[#C6FF34]" : "text-[#666666]"
                }`}
              />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {progress.progress === 100
                ? "Certificate Earned!"
                : "Complete to Earn Certificate"}
            </h3>
            <p className="text-[#A0A0A0] text-sm max-w-md mx-auto mb-6">
              {progress.progress === 100
                ? "Congratulations! You have completed this course. Download your certificate of completion."
                : `Finish all ${course.lessons.length} lessons to earn your certificate of completion and boost your WRI score.`}
            </p>
            {progress.progress === 100 ? (
              <button
                onClick={() => {
                  const certText = `LEVAV TALENT AFRIKA - CERTIFICATE OF COMPLETION\n\n${course.title}\nCompleted by: Levav Talent\nDate: ${new Date().toLocaleDateString()}\n\nVerified by Levav Champions`;
                  const blob = new Blob([certText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${course.title.replace(/\s+/g, "_")}_Certificate.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors"
              >
                <Award className="w-5 h-5" />
                Download Certificate
              </button>
            ) : (
              <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full bg-[#C6FF34]/40"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LESSON ROW
   ═══════════════════════════════════════════════════════════════ */
function LessonRow({
  lesson,
  index,
  courseId,
  onStart,
}: {
  lesson: LearnLesson;
  index: number;
  courseId: string;
  onStart: () => void;
}) {
  const completed = isLessonCompleted(courseId, lesson.id);
  const unlocked = isLessonUnlocked(courseId, index);
  const typeConfig = LESSON_TYPE_CONFIG[lesson.type] || LESSON_TYPE_CONFIG.video;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        completed
          ? "bg-[#C6FF34]/[0.03] border-[#C6FF34]/20"
          : unlocked
          ? "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
          : "bg-white/[0.015] border-white/[0.04] opacity-50"
      }`}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      {/* Number / Check / Lock */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
        {completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <CheckCircle className="w-6 h-6 text-[#C6FF34]" />
          </motion.div>
        ) : !unlocked ? (
          <Lock className="w-5 h-5 text-[#666666]" />
        ) : (
          <span className="text-[#A0A0A0] text-sm font-medium">{index + 1}</span>
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`text-sm font-medium truncate ${
              completed ? "text-[#C6FF34]" : "text-white"
            }`}
          >
            {lesson.title}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: `${typeConfig.color}18`,
              color: typeConfig.color,
            }}
          >
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>
          <span className="text-[#666666] text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.duration}
          </span>
        </div>
      </div>

      {/* Action button */}
      {unlocked && (
        <button
          onClick={onStart}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            completed
              ? "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20 hover:bg-[#C6FF34]/20"
              : "bg-[#C6FF34] text-black hover:bg-[#d4ff5c]"
          }`}
        >
          {completed ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              Completed
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Start Lesson
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 3 — LESSON VIEWER
   ═══════════════════════════════════════════════════════════════ */
function LessonViewer({
  courseId,
  lessonId,
  onBackToCourse,
  onAddToast,
  onNavigateLesson,
}: {
  courseId: string;
  lessonId: string;
  onBackToCourse: () => void;
  onAddToast: (toast: Toast) => void;
  onNavigateLesson: (newLessonId: string) => void;
}) {
  const course = React.useMemo(
    () => LEARN_COURSES.find((c) => c.id === courseId)!,
    [courseId]
  );
  const lessonIndex = React.useMemo(
    () => course?.lessons.findIndex((l) => l.id === lessonId) ?? -1,
    [course, lessonId]
  );
  const lesson = course?.lessons[lessonIndex];

  const [isCompleted, setIsCompleted] = React.useState(() =>
    isLessonCompleted(courseId, lessonId)
  );
  const [justCompleted, setJustCompleted] = React.useState(false);

  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

  const handleMarkComplete = React.useCallback(() => {
    if (isCompleted) return;

    saveLessonCompletion(courseId, lessonId);
    awardWriPoints("learn-lesson-complete");
    setIsCompleted(true);
    setJustCompleted(true);

    onAddToast({
      id: `lesson-${lessonId}-${Date.now()}`,
      message: "Lesson Completed!",
      subMessage: "+5 WRI Points earned",
      type: "success",
    });

    // Check if course is now complete
    const updatedProgress = getCourseProgress(courseId);
    if (updatedProgress.progress === 100) {
      setTimeout(() => {
        awardWriPoints("learn-course-complete");
        onAddToast({
          id: `course-${courseId}-${Date.now()}`,
          message: "Course Complete!",
          subMessage: "+25 WRI Points earned. Certificate unlocked!",
          type: "courseComplete",
        });
      }, 1500);
    }

    setTimeout(() => setJustCompleted(false), 3000);
  }, [isCompleted, courseId, lessonId, onAddToast]);

  if (!course || !lesson) return null;

  const typeConfig = LESSON_TYPE_CONFIG[lesson.type] || LESSON_TYPE_CONFIG.video;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      key="lesson-viewer"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-black"
    >
      {/* ─── Breadcrumb Bar ─── */}
      <div className="bg-[#0A0A0A] border-b border-white/[0.06] pt-20 pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={onBackToCourse}
              className="text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {course.title}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
            <span className="text-[#C6FF34] font-medium truncate">{lesson.title}</span>
          </div>
        </div>
      </div>

      {/* ─── Lesson Content ─── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Lesson Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${typeConfig.color}18`,
                    color: typeConfig.color,
                  }}
                >
                  <TypeIcon className="w-3.5 h-3.5" />
                  {typeConfig.label}
                </span>
                <span className="text-[#666666] text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.duration}
                </span>
                {isCompleted && (
                  <span className="text-[#C6FF34] text-xs font-medium px-2 py-1 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl text-white mb-2">
                Lesson {lessonIndex + 1}: {lesson.title}
              </h1>
            </motion.div>

            {/* Content Card */}
            <motion.div
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {/* Video placeholder for video type */}
              {lesson.type === "video" && (
                <div
                  className="w-full h-56 sm:h-72 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, #C6FF34 0%, transparent 70%)`,
                    }}
                  />
                  <motion.button
                    className="relative z-10 w-16 h-16 rounded-full bg-[#C6FF34] flex items-center justify-center hover:bg-[#d4ff5c] transition-colors shadow-lg shadow-[#C6FF34]/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-6 h-6 text-black ml-1" />
                  </motion.button>
                </div>
              )}

              {/* Lesson text content */}
              <div className="prose-custom">
                <p className="text-[#A0A0A0] text-base leading-relaxed whitespace-pre-line">
                  {lesson.content}
                </p>
              </div>

              {/* Additional content sections for longer lessons */}
              {lesson.content.length > 200 && (
                <div className="mt-8 space-y-6">
                  <div className="h-px bg-white/[0.06]" />
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.04]">
                    <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C6FF34]" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {lesson.content
                        .split(".")
                        .filter((s) => s.trim().length > 20)
                        .slice(0, 3)
                        .map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#A0A0A0] text-sm">
                            <CheckCircle className="w-4 h-4 text-[#C6FF34] flex-shrink-0 mt-0.5" />
                            <span>{point.trim()}.</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Mark Complete Button */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {!isCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 py-4 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </button>
              ) : (
                <div className="flex-1 py-4 bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] font-semibold rounded-xl flex items-center justify-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                  Lesson Completed — +5 WRI Points
                </div>
              )}
            </motion.div>

            {/* Celebration animation */}
            <AnimatePresence>
              {justCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
                >
                  <div className="relative">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: i % 2 === 0 ? "#C6FF34" : "#7E3BED",
                        }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos((i * Math.PI) / 3) * 80,
                          y: Math.sin((i * Math.PI) / 3) * 80,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-[#C6FF34] flex items-center justify-center"
                    >
                      <CheckCircle className="w-10 h-10 text-black" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevLesson ? (
                <button
                  onClick={() => onNavigateLesson(prevLesson.id)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] text-[#A0A0A0] text-sm hover:border-white/[0.15] hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <button
                  onClick={() => onNavigateLesson(nextLesson.id)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C6FF34] text-black text-sm font-medium hover:bg-[#d4ff5c] transition-all"
                >
                  Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onBackToCourse}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7E3BED] text-white text-sm font-medium hover:bg-[#6b2fd4] transition-all"
                >
                  Back to Course
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-white text-sm font-semibold mb-4">Course Lessons</h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {course.lessons.map((l, i) => {
                  const lCompleted = isLessonCompleted(courseId, l.id);
                  const lUnlocked = isLessonUnlocked(courseId, i);
                  const isActive = l.id === lessonId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        if (lUnlocked && !isActive) {
                          onNavigateLesson(l.id);
                        }
                      }}
                      disabled={!lUnlocked || isActive}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        isActive
                          ? "bg-[#C6FF34]/10 border border-[#C6FF34]/20 cursor-default"
                          : lCompleted
                          ? "hover:bg-white/[0.03]"
                          : lUnlocked
                          ? "hover:bg-white/[0.03] opacity-70"
                          : "opacity-30 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex-shrink-0 w-6">
                        {lCompleted ? (
                          <CheckCircle className="w-4 h-4 text-[#C6FF34]" />
                        ) : !lUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-[#666666]" />
                        ) : (
                          <span className="text-[#666666] text-xs">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            isActive ? "text-[#C6FF34]" : lCompleted ? "text-[#A0A0A0]" : "text-white"
                          }`}
                        >
                          {l.title}
                        </p>
                        <p className="text-[#666666] text-[10px]">{l.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mini progress */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#666666]">Progress</span>
                  <span className="text-[#C6FF34] font-medium">
                    {getCourseProgress(courseId).progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                  <div
                    className="h-1.5 rounded-full bg-[#C6FF34]"
                    style={{ width: `${getCourseProgress(courseId).progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LEARN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Learn() {
  const [view, setView] = React.useState<ViewState>({ type: "catalog" });
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSelectCourse = React.useCallback((courseId: string) => {
    setView({ type: "course", courseId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectChampionCourse = React.useCallback((courseId: string) => {
    setView({ type: "course", courseId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectLesson = React.useCallback(
    (courseId: string, lessonId: string) => {
      setView({ type: "lesson", courseId, lessonId });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleBackToCatalog = React.useCallback(() => {
    setView({ type: "catalog" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToCourse = React.useCallback(
    (courseId: string) => {
      setView({ type: "course", courseId });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  return (
    <main className="bg-black min-h-screen relative">
      <AnimatePresence mode="wait">
        {view.type === "catalog" && (
          <CatalogView
            key="catalog"
            onSelectCourse={handleSelectCourse}
            onSelectChampionCourse={handleSelectChampionCourse}
          />
        )}

        {view.type === "course" && (
          <CourseDetailView
            key={`course-${view.courseId}`}
            courseId={view.courseId}
            onBack={handleBackToCatalog}
            onSelectLesson={(lessonId) => handleSelectLesson(view.courseId, lessonId)}
          />
        )}

        {view.type === "lesson" && (
          <LessonViewer
            key={`lesson-${view.courseId}-${view.lessonId}`}
            courseId={view.courseId}
            lessonId={view.lessonId}
            onBackToCourse={() => handleBackToCourse(view.courseId)}
            onAddToast={addToast}
            onNavigateLesson={(newLessonId) =>
              handleSelectLesson(view.courseId, newLessonId)
            }
          />
        )}
      </AnimatePresence>

      {/* Toast Stack */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <CelebrationToast
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </main>
  );
}
