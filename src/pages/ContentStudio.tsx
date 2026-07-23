import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  BookOpen,
  Users,
  Star,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  Trophy,
  Sparkles,
  ChevronRight,
  Clock,
  FileText,
  Video,
  HelpCircle,
  FolderKanban,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Save,
  Globe,
  GraduationCap,
  PlayCircle,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';
import { safeJSONParse } from '@/lib/safeJSON';
import { useAuth } from '@/hooks/useAuth';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz' | 'project';
  content: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  thumbnail: string;
  lessons: Lesson[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  students?: number;
  rating?: number;
  completionRate?: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'content_studio_courses';

const saveChampionCourse = (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
  const existing = safeJSONParse<Course[]>(STORAGE_KEY, []);
  const newCourse: Course = {
    ...course,
    id: `champ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    students: Math.floor(Math.random() * 150) + 5,
    rating: Number((Math.random() * 2 + 3).toFixed(1)),
    completionRate: Math.floor(Math.random() * 40) + 40,
  };
  existing.push(newCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return newCourse;
};

const updateChampionCourse = (id: string, updates: Partial<Course>) => {
  const existing = safeJSONParse<Course[]>(STORAGE_KEY, []);
  const idx = existing.findIndex((c) => c.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
};

const deleteChampionCourse = (id: string) => {
  const existing = safeJSONParse<Course[]>(STORAGE_KEY, []);
  const filtered = existing.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

const getChampionCourses = (): Course[] => safeJSONParse<Course[]>(STORAGE_KEY, []);

const CATEGORY_OPTIONS = [
  { value: 'Professional Development', label: 'Professional Development' },
  { value: 'Skills Development', label: 'Skills Development' },
  { value: 'Leadership Training', label: 'Leadership Training' },
  { value: 'Creative Arts', label: 'Creative Arts' },
  { value: 'Technology', label: 'Technology' },
];

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'project', label: 'Project' },
];

const glassCard =
  'bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl';

const mockCourses: Course[] = [
  {
    id: 'demo-1',
    title: 'African Leadership Mastery',
    description: 'Learn the principles of transformative leadership rooted in African values and modern management practices.',
    category: 'Leadership Training',
    duration: '8 weeks',
    thumbnail: '🦁',
    lessons: [
      { id: 'l1', title: 'Introduction to African Leadership', duration: '45 min', type: 'video', content: 'Overview of leadership styles across Africa.' },
      { id: 'l2', title: 'Ubuntu Philosophy in Management', duration: '30 min', type: 'article', content: 'Deep dive into Ubuntu and its application.' },
    ],
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    students: 124,
    rating: 4.8,
    completionRate: 78,
  },
  {
    id: 'demo-2',
    title: 'Creative Storytelling for Brands',
    description: 'Master the art of brand storytelling using African narratives and digital media.',
    category: 'Creative Arts',
    duration: '6 weeks',
    thumbnail: '🎨',
    lessons: [
      { id: 'l3', title: 'The Power of Story', duration: '20 min', type: 'video', content: 'Why stories matter in branding.' },
    ],
    status: 'published',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    students: 89,
    rating: 4.6,
    completionRate: 65,
  },
  {
    id: 'demo-3',
    title: 'Tech Entrepreneurship 101',
    description: 'From idea to MVP — building tech startups in the African ecosystem.',
    category: 'Technology',
    duration: '10 weeks',
    thumbnail: '💻',
    lessons: [],
    status: 'draft',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    students: 0,
    rating: 0,
    completionRate: 0,
  },
];

/* ------------------------------------------------------------------ */
/* Locked State Component                                               */
/* ------------------------------------------------------------------ */

function ChampionsOnlyLocked() {
  const benefits = [
    'Create unlimited courses and lessons',
    'Mentor thousands of African talents',
    'Earn revenue from course enrollments',
    'Get featured on the Levav platform',
    'Access detailed student analytics',
    'Join an exclusive network of industry leaders',
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#C6FF34]/10 to-[#7E3BED]/10 border border-[#C6FF34]/20 mb-8"
          >
            <Lock className="w-14 h-14 text-[#C6FF34]" strokeWidth={1.5} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-[#C6FF34]/20"
            />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Champions Only
          </h1>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed">
            The Content Studio is an exclusive workspace for Levav Champions — verified
            industry leaders who create world-class courses and mentor the next generation
            of African talent.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`${glassCard} p-8 mb-8`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-[#C6FF34]" />
            <h2 className="text-xl font-semibold text-white">Champion Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-[#C6FF34] mt-0.5 shrink-0" />
                <span className="text-[#A0A0A0] text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <Link
            to="/champion-apply"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#C6FF34] text-black font-semibold rounded-2xl hover:bg-[#d4ff5c] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)]"
          >
            <Sparkles className="w-5 h-5" />
            Apply to Become a Champion
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-[#666666]">
            Our team reviews applications within 3-5 business days.
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-[#666666] text-sm mb-4">Trusted by industry leaders across Africa</p>
          <div className="flex justify-center items-center gap-8 text-[#444444]">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">12 Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-medium">500+ Champions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">50K+ Students</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`${glassCard} p-6`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-[#A0A0A0]">{label}</div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Course Card                                                         */
/* ------------------------------------------------------------------ */

function CourseCard({
  course,
  onEdit,
  onDelete,
}: {
  course: Course;
  onEdit: (c: Course) => void;
  onDelete: (id: string) => void;
}) {
  const isPublished = course.status === 'published';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`${glassCard} overflow-hidden group hover:border-white/[0.12] transition-all duration-300`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{course.thumbnail}</div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPublished
                  ? 'bg-[#C6FF34]/10 text-[#C6FF34]'
                  : 'bg-white/5 text-[#666666]'
              }`}
            >
              {course.status}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#C6FF34] transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-[#A0A0A0] mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-4 text-xs text-[#666666] mb-4">
          <span className="flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5" />
            {course.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessons?.length ?? 0} lessons
          </span>
        </div>

        {isPublished && (
          <div className="flex items-center gap-4 mb-4 pt-4 border-t border-white/[0.06]">
            <span className="flex items-center gap-1 text-sm text-[#A0A0A0]">
              <Users className="w-4 h-4 text-[#7E3BED]" />
              {course.students} students
            </span>
            <span className="flex items-center gap-1 text-sm text-[#A0A0A0]">
              <Star className="w-4 h-4 text-[#C6FF34]" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1 text-sm text-[#A0A0A0]">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {course.completionRate}%
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(course)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#A0A0A0] hover:text-white text-sm font-medium transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty State                                                         */
/* ------------------------------------------------------------------ */

function EmptyCourses({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${glassCard} p-12 text-center`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#C6FF34]/10 flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-[#C6FF34]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
      <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
        Start creating your first course and share your expertise with thousands of learners across Africa.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all hover:scale-[1.02]"
      >
        <Plus className="w-5 h-5" />
        Create Your First Course
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Create Course Tab                                                   */
/* ------------------------------------------------------------------ */

function CreateCourseTab({
  onCourseCreated,
  editCourse,
  onClearEdit,
}: {
  onCourseCreated: () => void;
  editCourse: Course | null;
  onClearEdit: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [savedMsg, setSavedMsg] = useState('');

  /* Prefill when editing */
  useEffect(() => {
    if (editCourse) {
      setTitle(editCourse.title);
      setDescription(editCourse.description);
      setCategory(editCourse.category);
      setDuration(editCourse.duration);
      setThumbnail(editCourse.thumbnail);
      setLessons(editCourse.lessons?.length ? editCourse.lessons : []);
    }
  }, [editCourse]);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        id: `lesson-${Date.now()}`,
        title: '',
        duration: '',
        type: 'video',
        content: '',
      },
    ]);
  };

  const removeLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLesson = (id: string, field: keyof Lesson, value: string) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setDuration('');
    setThumbnail('');
    setLessons([]);
    setSavedMsg('');
    onClearEdit();
  };

  const handleSave = (asDraft: boolean) => {
    if (!title.trim()) return;

    const courseData = {
      title: title.trim(),
      description: description.trim(),
      category,
      duration: duration.trim(),
      thumbnail: thumbnail.trim() || '📚',
      lessons,
      status: asDraft ? ('draft' as const) : ('published' as const),
    };

    if (editCourse) {
      updateChampionCourse(editCourse.id, courseData);
      setSavedMsg('Course updated successfully!');
    } else {
      saveChampionCourse(courseData);
      setSavedMsg(asDraft ? 'Saved as draft!' : 'Course published!');
    }

    setTimeout(() => {
      resetForm();
      onCourseCreated();
    }, 1200);
  };

  const isValid = title.trim() && category;

  const lessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'project':
        return <FolderKanban className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Saved Message */}
      <AnimatePresence>
        {savedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34]"
          >
            <CheckCircle2 className="w-5 h-5" />
            {savedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Details */}
      <div className={`${glassCard} p-6`}>
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7E3BED]" />
          Course Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <StableInput
              label="Course Title"
              value={title}
              onChange={(v) => setTitle(v)}
              placeholder="e.g., African Leadership Mastery"
            />
          </div>
          <div className="sm:col-span-2">
            <StableTextarea
              label="Description"
              value={description}
              onChange={(v) => setDescription(v)}
              placeholder="Describe what students will learn..."
            />
          </div>
          <StableSelect
            label="Category"
            value={category}
            onChange={(v) => setCategory(v)}
            options={CATEGORY_OPTIONS}
            placeholder="Select a category"
          />
          <StableInput
            label="Duration Estimate"
            value={duration}
            onChange={(v) => setDuration(v)}
            placeholder="e.g., 8 weeks"
          />
          <div className="sm:col-span-2">
            <StableInput
              label="Thumbnail Emoji"
              value={thumbnail}
              onChange={(v) => setThumbnail(v)}
              placeholder="e.g., 🦁 (or any emoji)"
            />
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className={`${glassCard} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#7E3BED]" />
            Lessons
            {lessons.length > 0 && (
              <span className="text-sm text-[#666666] font-normal">({lessons.length})</span>
            )}
          </h3>
          <button
            onClick={addLesson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C6FF34]/10 hover:bg-[#C6FF34]/20 text-[#C6FF34] text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/[0.08] rounded-xl">
            <PlayCircle className="w-10 h-10 text-[#444444] mx-auto mb-3" />
            <p className="text-[#666666] text-sm">No lessons added yet. Click "Add Lesson" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#7E3BED]/20 text-[#7E3BED] text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-[#A0A0A0] font-medium">
                        Lesson {index + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeLesson(lesson.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#666666] hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <StableInput
                        label="Lesson Title"
                        value={lesson.title}
                        onChange={(v) => updateLesson(lesson.id, 'title', v)}
                        placeholder="e.g., Introduction to..."
                      />
                    </div>
                    <StableInput
                      label="Duration"
                      value={lesson.duration}
                      onChange={(v) => updateLesson(lesson.id, 'duration', v)}
                      placeholder="e.g., 30 min"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <StableSelect
                      label="Type"
                      value={lesson.type}
                      onChange={(v) => updateLesson(lesson.id, 'type', v)}
                      options={LESSON_TYPE_OPTIONS}
                    />
                    <div className="sm:col-span-2">
                      <StableTextarea
                        label="Content"
                        value={lesson.content}
                        onChange={(v) => updateLesson(lesson.id, 'content', v)}
                        placeholder="Describe the lesson content..."
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => handleSave(true)}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#A0A0A0] hover:text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C6FF34] text-black font-semibold hover:bg-[#d4ff5c] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5" />
          Publish Course
        </button>
        {editCourse && (
          <button
            onClick={resetForm}
            className="ml-auto px-6 py-3 rounded-xl text-[#666666] hover:text-white font-medium transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* My Courses Tab                                                      */
/* ------------------------------------------------------------------ */

function MyCoursesTab({
  courses,
  onEdit,
  onDelete,
  onCreateNew,
}: {
  courses: Course[];
  onEdit: (c: Course) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}) {
  const published = courses.filter((c) => c.status === 'published');
  const drafts = courses.filter((c) => c.status === 'draft');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {courses.length === 0 ? (
        <EmptyCourses onCreate={onCreateNew} />
      ) : (
        <>
          {/* Published Courses */}
          {published.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C6FF34]" />
                  Published
                  <span className="text-sm text-[#666666] font-normal">({published.length})</span>
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {published.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Draft Courses */}
          {drafts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Save className="w-5 h-5 text-[#666666]" />
                  Drafts
                  <span className="text-sm text-[#666666] font-normal">({drafts.length})</span>
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {drafts.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* New Course Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onCreateNew}
            className={`w-full ${glassCard} p-8 border-dashed border-white/[0.12] hover:border-[#C6FF34]/30 hover:bg-[#C6FF34]/[0.02] transition-all group`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C6FF34]/10 flex items-center justify-center group-hover:bg-[#C6FF34]/20 transition-all">
                <Plus className="w-6 h-6 text-[#C6FF34]" />
              </div>
              <span className="text-white font-medium">Create New Course</span>
              <span className="text-sm text-[#666666]">
                Share your expertise with the world
              </span>
            </div>
          </motion.button>
        </>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics Tab                                                       */
/* ------------------------------------------------------------------ */

function AnalyticsTab({ courses }: { courses: Course[] }) {
  const published = courses.filter((c) => c.status === 'published');

  const totalStudents = published.reduce((sum, c) => sum + (c.students || 0), 0);
  const avgRating =
    published.length > 0
      ? (published.reduce((sum, c) => sum + (c.rating || 0), 0) / published.length).toFixed(1)
      : '0';
  const avgCompletion =
    published.length > 0
      ? Math.floor(
          published.reduce((sum, c) => sum + (c.completionRate || 0), 0) / published.length
        )
      : 0;

  /* Mock monthly enrollment data (derived from student counts) */
  const barData = [
    { month: 'Jan', value: Math.floor(totalStudents * 0.1) },
    { month: 'Feb', value: Math.floor(totalStudents * 0.15) },
    { month: 'Mar', value: Math.floor(totalStudents * 0.2) },
    { month: 'Apr', value: Math.floor(totalStudents * 0.25) },
    { month: 'May', value: Math.floor(totalStudents * 0.35) },
    { month: 'Jun', value: Math.floor(totalStudents * 0.5) },
    { month: 'Jul', value: Math.floor(totalStudents * 0.65) },
    { month: 'Aug', value: totalStudents },
  ];
  const maxBar = Math.max(...barData.map((d) => d.value), 1);

  const completionData = published.map((c) => ({
    name: c.title,
    value: c.completionRate || 0,
    color: c.completionRate && c.completionRate > 70 ? '#C6FF34' : c.completionRate && c.completionRate > 50 ? '#7E3BED' : '#444444',
  }));

  const feedbackData = [
    { rating: 5, count: Math.floor(totalStudents * 0.45), pct: 45 },
    { rating: 4, count: Math.floor(totalStudents * 0.3), pct: 30 },
    { rating: 3, count: Math.floor(totalStudents * 0.15), pct: 15 },
    { rating: 2, count: Math.floor(totalStudents * 0.07), pct: 7 },
    { rating: 1, count: Math.floor(totalStudents * 0.03), pct: 3 },
  ];

  const topLessons = [
    { name: 'Introduction to African Leadership', views: 892, course: 'African Leadership Mastery' },
    { name: 'Ubuntu Philosophy in Management', views: 756, course: 'African Leadership Mastery' },
    { name: 'The Power of Story', views: 634, course: 'Creative Storytelling for Brands' },
    { name: 'Building Your MVP', views: 521, course: 'Tech Entrepreneurship 101' },
    { name: 'Brand Voice Workshop', views: 487, course: 'Creative Storytelling for Brands' },
  ];

  if (published.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${glassCard} p-12 text-center`}
      >
        <BarChart3 className="w-12 h-12 text-[#444444] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No analytics yet</h3>
        <p className="text-[#A0A0A0]">
          Publish your first course to start seeing analytics.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Summary Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#7E3BED]" />
            <span className="text-sm text-[#A0A0A0]">Total Students</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</div>
        </div>
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-[#C6FF34]" />
            <span className="text-sm text-[#A0A0A0]">Avg. Rating</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgRating}</div>
        </div>
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-[#A0A0A0]">Avg. Completion</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgCompletion}%</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Bar Chart */}
        <div className={`${glassCard} p-6`}>
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#7E3BED]" />
            Enrollment Growth
          </h3>
          <div className="flex items-end gap-3 h-48">
            {barData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / maxBar) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#7E3BED] to-[#C6FF34] relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.value}
                  </div>
                </motion.div>
                <span className="text-xs text-[#666666]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className={`${glassCard} p-6`}>
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#C6FF34]" />
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {feedbackData.map((f) => (
              <div key={f.rating} className="flex items-center gap-3">
                <span className="text-sm text-[#A0A0A0] w-6">{f.rating}★</span>
                <div className="flex-1 h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.pct}%` }}
                    transition={{ duration: 0.8, delay: f.rating * 0.1 }}
                    className="h-full rounded-full bg-[#C6FF34]"
                  />
                </div>
                <span className="text-xs text-[#666666] w-10 text-right">{f.pct}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-[#A0A0A0]">Total Reviews</span>
            <span className="text-sm font-semibold text-white">
              {feedbackData.reduce((s, f) => s + f.count, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Completion Rates */}
        <div className={`${glassCard} p-6`}>
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Completion Rates
          </h3>
          <div className="space-y-4">
            {completionData.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[#A0A0A0] truncate max-w-[70%]">{c.name}</span>
                  <span className="text-sm font-medium" style={{ color: c.color }}>
                    {c.value}%
                  </span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.value}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Lessons */}
        <div className={`${glassCard} p-6`}>
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#7E3BED]" />
            Top Performing Lessons
          </h3>
          <div className="space-y-3">
            {topLessons.map((l, i) => (
              <div
                key={l.name}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? 'bg-[#C6FF34]/20 text-[#C6FF34]'
                      : i === 1
                      ? 'bg-[#7E3BED]/20 text-[#7E3BED]'
                      : i === 2
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/[0.05] text-[#666666]'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{l.name}</p>
                  <p className="text-xs text-[#666666]">{l.course}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#A0A0A0]">
                  <PlayCircle className="w-4 h-4" />
                  {l.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Feedback Summary */}
      <div className={`${glassCard} p-6`}>
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#C6FF34]" />
          Recent Student Feedback
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Amina K.',
              text: 'This course transformed my approach to leadership. The Ubuntu philosophy section was eye-opening!',
              rating: 5,
              course: 'African Leadership Mastery',
            },
            {
              name: 'David O.',
              text: 'Practical, actionable insights. I applied the storytelling framework to my brand immediately.',
              rating: 5,
              course: 'Creative Storytelling for Brands',
            },
            {
              name: 'Sarah M.',
              text: 'Great content but I wish there were more quizzes to test understanding. Overall solid course.',
              rating: 4,
              course: 'African Leadership Mastery',
            },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C6FF34]/20 to-[#7E3BED]/20 flex items-center justify-center text-xs font-bold text-white">
                  {f.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-white">{f.name}</span>
                <div className="ml-auto flex">
                  {Array.from({ length: f.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-[#C6FF34]" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#A0A0A0] mb-2">{f.text}</p>
              <p className="text-xs text-[#666666]">{f.course}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main ContentStudio Page                                             */
/* ------------------------------------------------------------------ */

export default function ContentStudio() {
  const { user } = useAuth();
  const isChampion = user?.role === 'champion';

  const [activeTab, setActiveTab] = useState<'courses' | 'create' | 'analytics'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  /* Load courses from localStorage + mock data */
  useEffect(() => {
    const stored = getChampionCourses();
    /* Merge mock courses with stored, avoiding duplicates */
    const storedIds = new Set(stored.map((c) => c.id));
    const merged = [...stored, ...mockCourses.filter((c) => !storedIds.has(c.id))];
    setCourses(merged);
  }, []);

  const refreshCourses = useCallback(() => {
    setCourses(getChampionCourses());
    setActiveTab('courses');
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteChampionCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleEdit = useCallback((course: Course) => {
    setEditCourse(course);
    setActiveTab('create');
  }, []);

  const handleClearEdit = useCallback(() => {
    setEditCourse(null);
  }, []);

  /* Stats */
  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === 'published');
    return {
      totalCourses: courses.length,
      totalLessons: courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0),
      totalStudents: published.reduce((sum, c) => sum + (c.students || 0), 0),
      avgRating:
        published.length > 0
          ? (published.reduce((sum, c) => sum + (c.rating || 0), 0) / published.length).toFixed(1)
          : '0.0',
    };
  }, [courses]);

  /* Tabs config */
  const tabs = [
    { key: 'courses' as const, label: 'My Courses', icon: BookOpen },
    { key: 'create' as const, label: editCourse ? 'Edit Course' : 'Create Course', icon: Plus },
    { key: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  /* ── Non-champion locked state ── */
  if (!isChampion) {
    return <ChampionsOnlyLocked />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#C6FF34]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Studio</h1>
              <p className="text-sm text-[#A0A0A0]">
                Create, manage, and analyze your courses
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={String(stats.totalCourses)}
            accent="#C6FF34"
            delay={0}
          />
          <StatCard
            icon={GraduationCap}
            label="Lessons Published"
            value={String(stats.totalLessons)}
            accent="#7E3BED"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            label="Students Enrolled"
            value={stats.totalStudents.toLocaleString()}
            accent="#34d399"
            delay={0.2}
          />
          <StatCard
            icon={Star}
            label="Avg. Rating"
            value={stats.avgRating}
            accent="#fbbf24"
            delay={0.3}
          />
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8 w-fit"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                if (t.key !== 'create') setEditCourse(null);
              }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === t.key
                  ? 'text-black'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {activeTab === t.key && (
                <motion.div
                  layoutId="studioTab"
                  className="absolute inset-0 bg-[#C6FF34] rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <t.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MyCoursesTab
                courses={courses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreateNew={() => {
                  setEditCourse(null);
                  setActiveTab('create');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CreateCourseTab
                onCourseCreated={refreshCourses}
                editCourse={editCourse}
                onClearEdit={handleClearEdit}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsTab courses={courses} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
