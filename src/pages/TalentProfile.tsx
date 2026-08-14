import { useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  Award,
  ExternalLink,
  MessageSquare,
  Briefcase,
  Bookmark,
  Heart,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { trpc } from "@/providers/trpc";
import { safeJSONParse } from "@/lib/safeJSON";
import { useAuth } from "@/hooks/useAuth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ───────────────────── Types ───────────────────── */
interface TalentProfile {
  id: string;
  name: string;
  role: string;
  category: string;
  tier: string;
  location: string;
  rate: string;
  bio: string;
  skills: string[];
  wri: number;
  portfolio?: Array<{ title: string; url?: string; desc?: string }>;
  reviews?: Array<{
    reviewer: string;
    role: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  memberSince?: string;
  profileCompletion?: number;
  avatar?: string | null;
}

/* ───────────────────── Mock Data (from TalentDirectory) ───────────────────── */
const MOCK_TALENTS: TalentProfile[] = [
  {
    id: "1",
    name: "Mutale Mwanza",
    role: "Senior Frontend Developer",
    category: "Technology",
    tier: "Platinum",
    location: "Lusaka, Zambia",
    rate: "ZMW 800/hour",
    bio: "Full-stack developer with 6 years experience building fintech platforms across Africa. Passionate about clean code and scalable architecture. Led engineering teams at two startups and mentored over 20 junior developers through the Levav program.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "GraphQL", "Docker"],
    wri: 87,
    portfolio: [
      { title: "Fintech Dashboard", url: "#", desc: "Real-time analytics for Zambian mobile payments" },
      { title: "E-Commerce Platform", url: "#", desc: "Full-stack solution for African artisans" },
      { title: "HealthTech App", url: "#", desc: "Telemedicine platform serving rural communities" },
    ],
    reviews: [
      { reviewer: "David Banda", role: "CTO, PayZed", rating: 5, comment: "Mutale delivered exceptional work on our payments platform. His technical depth and professionalism are outstanding.", date: "2024-12-15" },
      { reviewer: "Sarah Lungu", role: "Product Lead", rating: 5, comment: "One of the best frontend engineers we've worked with. Highly recommend for any React project.", date: "2024-11-20" },
      { reviewer: "James Mwale", role: "Startup Founder", rating: 4, comment: "Incredible attention to detail and great communication throughout the engagement.", date: "2024-10-08" },
    ],
    memberSince: "2023-03-15",
    profileCompletion: 95,
  },
  {
    id: "2",
    name: "Grace Lungu",
    role: "Product Designer",
    category: "Visual Arts",
    tier: "Gold",
    location: "Ndola, Zambia",
    rate: "ZMW 600/hour",
    bio: "Award-winning product designer with a focus on accessible, human-centered design for emerging markets. Her design systems have been adopted by teams across 4 countries.",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research", "Branding"],
    wri: 82,
    portfolio: [
      { title: "Banking App Redesign", url: "#", desc: "Complete UX overhaul for a major African bank" },
      { title: "AgriTech Platform", url: "#", desc: "Design system for farm management software" },
    ],
    reviews: [
      { reviewer: "Amina Bello", role: "PM, AgriTech Co", rating: 5, comment: "Grace's designs transformed our product. User engagement increased by 50% after the redesign.", date: "2024-12-01" },
      { reviewer: "Robert Asante", role: "CEO, TravelHub", rating: 5, comment: "Exceptional designer who truly understands the African market.", date: "2024-09-15" },
    ],
    memberSince: "2023-06-01",
    profileCompletion: 88,
  },
  {
    id: "3",
    name: "Amara Okafor",
    role: "Data Scientist",
    category: "Technology",
    tier: "Gold",
    location: "Lagos, Nigeria",
    rate: "\u20A65,000/hour",
    bio: "Data scientist specializing in predictive analytics for agriculture and healthcare in West Africa. Published researcher with expertise in machine learning model deployment.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Visualization", "NLP"],
    wri: 79,
    portfolio: [
      { title: "Crop Yield Predictor", url: "#", desc: "ML model helping 10,000+ farmers optimize harvests" },
      { title: "Fraud Detection System", url: "#", desc: "Real-time anomaly detection for mobile money" },
    ],
    reviews: [
      { reviewer: "Dr. Kimani", role: "Research Director", rating: 5, comment: "Amara's expertise in machine learning is remarkable. She delivered beyond expectations.", date: "2024-11-10" },
      { reviewer: "Lisa Chen", role: "VP Data, FinCorp", rating: 5, comment: "Brilliant data scientist with deep understanding of African markets.", date: "2024-08-22" },
      { reviewer: "Olu Adeyemi", role: "Founder, FarmStack", rating: 4, comment: "Great work on our predictive models. Would definitely hire again.", date: "2024-07-14" },
    ],
    memberSince: "2023-01-20",
    profileCompletion: 92,
  },
  {
    id: "4",
    name: "Kofi Mensah",
    role: "Mobile Developer",
    category: "Technology",
    tier: "Silver",
    location: "Accra, Ghana",
    rate: "GHS 400/hour",
    bio: "Mobile developer who has shipped 8 apps to the Play Store with over 500K combined downloads. Specializes in cross-platform development with React Native and Flutter.",
    skills: ["React Native", "Flutter", "Firebase", "iOS", "Android", "Dart"],
    wri: 76,
    portfolio: [
      { title: "Delivery App", url: "#", desc: "On-demand delivery platform for Ghanaian market" },
      { title: "Education App", url: "#", desc: "Interactive learning app for primary school students" },
    ],
    reviews: [
      { reviewer: "Nana Yaa", role: "EdTech Founder", rating: 5, comment: "Kofi built our app from scratch and it now has 100K+ downloads. Amazing work!", date: "2024-10-30" },
      { reviewer: "Kwame Asare", role: "Product Manager", rating: 4, comment: "Reliable developer with great technical skills. Delivered on time.", date: "2024-09-05" },
    ],
    memberSince: "2023-08-10",
    profileCompletion: 85,
  },
  {
    id: "5",
    name: "Zara Ibrahim",
    role: "UX Researcher",
    category: "Visual Arts",
    tier: "Platinum",
    location: "Nairobi, Kenya",
    rate: "KES 3,000/hour",
    bio: "UX researcher with expertise in conducting field studies across East African rural communities. Her research has shaped products used by millions.",
    skills: ["User Research", "Interviewing", "Analysis", "Figma", "Personas", "Journey Mapping"],
    wri: 84,
    portfolio: [
      { title: "Rural Banking Study", url: "#", desc: "Ethnographic research informing product strategy" },
      { title: "Health Platform UX", url: "#", desc: "User research for telemedicine adoption" },
    ],
    reviews: [
      { reviewer: "Aisha Mohammed", role: "Design Director", rating: 5, comment: "Zara's research insights were invaluable. Completely changed our product direction for the better.", date: "2024-12-10" },
      { reviewer: "Tom Mboya", role: "CEO, HealthFirst", rating: 5, comment: "The depth of Zara's field research is unmatched. Highly recommended.", date: "2024-11-05" },
    ],
    memberSince: "2022-11-15",
    profileCompletion: 97,
  },
  {
    id: "6",
    name: "Tendai Mutasa",
    role: "Marketing Strategist",
    category: "Business",
    tier: "Silver",
    location: "Harare, Zimbabwe",
    rate: "USD 50/hour",
    bio: "Marketing strategist who grew three startups from zero to 100K users in under 12 months. Expert in growth hacking and emerging market strategies.",
    skills: ["Marketing", "Growth Hacking", "Social Media", "Analytics", "Copywriting", "SEO"],
    wri: 71,
    portfolio: [
      { title: "Growth Campaign", url: "#", desc: "0 to 50K users in 6 months for fintech startup" },
      { title: "Brand Strategy", url: "#", desc: "Complete rebrand for pan-African logistics company" },
    ],
    reviews: [
      { reviewer: "Rudo Chikwava", role: "Founder, AgriApp", rating: 4, comment: "Tendai's growth strategies helped us reach farmers we never thought we could access.", date: "2024-09-20" },
    ],
    memberSince: "2023-05-01",
    profileCompletion: 78,
  },
  {
    id: "7",
    name: "Amina Diallo",
    role: "DevOps Engineer",
    category: "Technology",
    tier: "Gold",
    location: "Dakar, Senegal",
    rate: "CFA 50,000/hour",
    bio: "DevOps engineer specializing in cloud infrastructure for African tech startups. AWS certified with experience managing systems serving millions of users.",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    wri: 80,
    portfolio: [
      { title: "Cloud Migration", url: "#", desc: "Migrated 12 services to AWS with zero downtime" },
      { title: "K8s Cluster Setup", url: "#", desc: "Production Kubernetes cluster for payments platform" },
    ],
    reviews: [
      { reviewer: "Pierre Ndiaye", role: "CTO, Wave Senegal", rating: 5, comment: "Amina's infrastructure work was flawless. She reduced our deployment time by 80%.", date: "2024-10-25" },
      { reviewer: "Fatou Sall", role: "Engineering Manager", rating: 4, comment: "Excellent DevOps engineer. Very knowledgeable and professional.", date: "2024-08-12" },
    ],
    memberSince: "2023-02-28",
    profileCompletion: 90,
  },
  {
    id: "8",
    name: "Chidi Okafor",
    role: "Backend Engineer",
    category: "Technology",
    tier: "Gold",
    location: "Enugu, Nigeria",
    rate: "\u20A66,000/hour",
    bio: "Backend engineer with deep expertise in building high-throughput payment systems. Experienced in distributed systems and microservices architecture.",
    skills: ["Go", "Python", "Microservices", "Redis", "Kafka", "PostgreSQL"],
    wri: 75,
    portfolio: [
      { title: "Payment Gateway", url: "#", desc: "Processing 1M+ transactions daily" },
      { title: "Real-Time API", url: "#", desc: "WebSocket service for live market data" },
    ],
    reviews: [
      { reviewer: "Emeka Nwosu", role: "VP Engineering", rating: 5, comment: "Chidi is a backend wizard. Our system performance improved 10x under his leadership.", date: "2024-11-18" },
    ],
    memberSince: "2023-04-10",
    profileCompletion: 87,
  },
  {
    id: "9",
    name: "Pastor James Mwale",
    role: "Pastoral Counselor",
    category: "Education",
    tier: "Gold",
    location: "Lusaka, Zambia",
    rate: "Negotiable",
    bio: "Community leader and pastoral counselor with 15 years experience in youth development programs. Dedicated to empowering the next generation through mentorship and skills training.",
    skills: ["Counseling", "Public Speaking", "Leadership", "Community Organizing", "Training"],
    wri: 88,
    portfolio: [
      { title: "Youth Program", url: "#", desc: "Trained 500+ youth in leadership and life skills" },
      { title: "Community Center", url: "#", desc: "Established counseling center serving 200+ families" },
    ],
    reviews: [
      { reviewer: "Mary Banda", role: "Program Director", rating: 5, comment: "Pastor Mwale's counseling transformed our youth program. The impact has been remarkable.", date: "2024-12-05" },
      { reviewer: "John Phiri", role: "Community Leader", rating: 5, comment: "A true servant leader. His dedication to the community is inspiring.", date: "2024-10-15" },
    ],
    memberSince: "2022-09-01",
    profileCompletion: 93,
  },
  {
    id: "10",
    name: "Fatima Said",
    role: "Agricultural Engineer",
    category: "Agriculture",
    tier: "Silver",
    location: "Dar es Salaam, Tanzania",
    rate: "TZS 100,000/hour",
    bio: "Agricultural engineer developing sustainable farming technologies for arid regions. Her irrigation solutions have improved crop yields by 40% for pilot communities.",
    skills: ["Agriculture", "Irrigation", "Soil Science", "Project Management", "Data Analysis"],
    wri: 73,
    portfolio: [
      { title: "Smart Irrigation", url: "#", desc: "IoT-based system reducing water usage by 35%" },
      { title: "Soil Analysis Tool", url: "#", desc: "Mobile app for farmers to test soil quality" },
    ],
    reviews: [
      { reviewer: "Dr. Mwinyi", role: "Research Head, TARI", rating: 4, comment: "Fatima's irrigation system is innovative and practical. Great results in our pilot program.", date: "2024-09-28" },
    ],
    memberSince: "2023-07-15",
    profileCompletion: 82,
  },
  {
    id: "11",
    name: "Nia Johnson",
    role: "AI Researcher",
    category: "Technology",
    tier: "Platinum",
    location: "Kigali, Rwanda",
    rate: "USD 80/hour",
    bio: "AI researcher working on natural language processing for African languages. Published 12 papers and contributed to open-source NLP toolkits used across the continent.",
    skills: ["AI/ML", "Python", "NLP", "PyTorch", "Research", "LLMs"],
    wri: 91,
    portfolio: [
      { title: "Kinyarwanda NLP", url: "#", desc: "Language model for Kinyarwanda with 95% accuracy" },
      { title: "Multilingual Toolkit", url: "#", desc: "Open-source NLP library for 10 African languages" },
    ],
    reviews: [
      { reviewer: "Prof. Jean Baptiste", role: "University of Rwanda", rating: 5, comment: "Nia's research is groundbreaking. She is pushing the boundaries of African language AI.", date: "2024-12-20" },
      { reviewer: "Claire Uwase", role: "Tech Lead, Digital Rwanda", rating: 5, comment: "Working with Nia elevated our entire AI strategy. Phenomenal researcher.", date: "2024-11-12" },
    ],
    memberSince: "2022-05-10",
    profileCompletion: 98,
  },
  {
    id: "12",
    name: "Dr. Omar Hassan",
    role: "Public Health Specialist",
    category: "Healthcare",
    tier: "Gold",
    location: "Cairo, Egypt",
    rate: "EGP 1,500/hour",
    bio: "Public health specialist focused on maternal health programs across North Africa. Led initiatives impacting over 2 million women across 4 countries.",
    skills: ["Public Health", "Epidemiology", "Research", "Program Management", "Data Analysis"],
    wri: 85,
    portfolio: [
      { title: "Maternal Health Program", url: "#", desc: "Improving healthcare access for 500K+ women" },
      { title: "Epidemiology Study", url: "#", desc: "Regional study on disease prevention patterns" },
    ],
    reviews: [
      { reviewer: "Dr. Fatima Al-Fayed", role: "WHO Regional Office", rating: 5, comment: "Dr. Hassan's public health expertise is exceptional. His programs have saved countless lives.", date: "2024-11-30" },
    ],
    memberSince: "2022-08-20",
    profileCompletion: 94,
  },
];

/* ───────────────────── Tier Config ───────────────────── */
const tierConfig: Record<string, { color: string; bg: string; border: string }> = {
  Platinum: { color: "#C6FF34", bg: "bg-[#C6FF34]/10", border: "border-[#C6FF34]/30", },
  Gold: { color: "#FBBF24", bg: "bg-amber-400/10", border: "border-amber-400/30", },
  Silver: { color: "#A0A0A0", bg: "bg-white/10", border: "border-white/20", },
};

/* ───────────────────── Card Component ───────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────── TalentNotFound ───────────────────── */
function TalentNotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-[#666666]" />
        </div>
        <h1 className="text-white text-3xl font-display mb-3">Talent Not Found</h1>
        <p className="text-[#666666] mb-8">
          The talent profile you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/talent"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse All Talent
        </Link>
      </motion.div>
    </div>
  );
}

/* ───────────────────── Format Date ───────────────────── */
function formatMemberSince(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatReviewDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ───────────────────── Get Initials ───────────────────── */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ───────────────────── Avatar Gradient ───────────────────── */
function getAvatarGradient(name: string) {
  const gradients = [
    "from-[#C6FF34] to-[#7E3BED]",
    "from-[#7E3BED] to-[#C6FF34]",
    "from-[#C6FF34] to-[#3B82F6]",
    "from-[#7E3BED] to-[#3B82F6]",
    "from-[#F59E0B] to-[#C6FF34]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

/* ═══════════════════════════════════════════════════════════
   TalentProfile Page
   ═══════════════════════════════════════════════════════════ */
export default function TalentProfile() {
  const { id } = useParams<{ id: string }>();
  const [saved, setSaved] = useState(false);

  // Real talent ids are UUIDs; mock ids are small integers like "1" — only
  // query the backend when the id actually looks like a real profile,
  // otherwise talent.getById's zod input validation would reject it.
  const isRealId = !!id && UUID_RE.test(id);
  const { data: realTalent } = trpc.talent.getById.useQuery(
    { id: id ?? "" },
    { enabled: isRealId }
  );
  const { isAuthenticated } = useAuth();
  const { data: ownProfile } = trpc.talent.getOwnProfile.useQuery(undefined, { enabled: isAuthenticated });

  /* ── Merge real backend data + mock data ── */
  const talent = useMemo(() => {
    if (isRealId) {
      if (!realTalent) return null;
      const extras = safeJSONParse<{ rate?: string; avatar?: string; portfolio?: TalentProfile["portfolio"] }>(
        "talent_profile_extras",
        {}
      );
      const isOwn = realTalent.id === ownProfile?.id;
      const mapped: TalentProfile = {
        id: realTalent.id,
        name: realTalent.name,
        role: realTalent.category ?? "Professional",
        category: realTalent.category ?? "General",
        tier: "Silver",
        location: realTalent.location ?? "Remote",
        rate: isOwn ? extras.rate || "Not set" : "Not set",
        bio: realTalent.bio ?? "",
        skills: realTalent.skills,
        wri: 0,
        avatar: isOwn ? extras.avatar ?? null : null,
        portfolio: isOwn ? extras.portfolio ?? [] : [],
        memberSince: realTalent.createdAt ? new Date(realTalent.createdAt).toISOString() : undefined,
      };
      return mapped;
    }
    const found = MOCK_TALENTS.find((t) => String(t.id) === String(id));
    return found || null;
  }, [id, isRealId, realTalent, ownProfile]);

  if (!talent) return <TalentNotFound />;

  const tierStyle = tierConfig[talent.tier] || tierConfig.Silver;
  const avgRating = talent.reviews?.length
    ? (talent.reviews.reduce((s, r) => s + r.rating, 0) / talent.reviews.length).toFixed(1)
    : "0";

  return (
    <main className="bg-black min-h-screen">
      {/* ── Subtle top gradient ── */}
      <div className="relative">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #7E3BED 0%, transparent 70%)" }}
        />

        {/* Back button */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/talent"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-xl text-[#A0A0A0] text-sm hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </motion.div>
        </div>

        {/* ═══════════ HERO SECTION ═══════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-6">
          <motion.div
            className="flex flex-col sm:flex-row gap-6 items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Gradient Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(talent.name)} flex items-center justify-center text-black font-bold text-2xl font-display shadow-lg shadow-[#C6FF34]/10`}
              >
                {talent.avatar ? (
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  getInitials(talent.name)
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
                {talent.name}
              </h1>

              {/* Role + Category */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[#C6FF34] text-sm font-medium">{talent.role}</span>
                <span className="text-[#444444]">&middot;</span>
                <span className="text-[#A0A0A0] text-xs bg-white/5 border border-white/[0.06] rounded-full px-3 py-1">
                  {talent.category}
                </span>
              </div>

              {/* Tier Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${tierStyle.bg} ${tierStyle.border}`}
                  style={{ color: tierStyle.color }}
                >
                  <Award className="w-3.5 h-3.5" />
                  {talent.tier}
                </span>

                {/* Location */}
                <span className="inline-flex items-center gap-1.5 text-[#666666] text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {talent.location}
                </span>

                {/* Rate */}
                <span className="inline-flex items-center gap-1.5 text-[#C6FF34] text-xs font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {talent.rate}
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* ── Left Column (2/3) ── */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* ── About Section ── */}
            <motion.div variants={fadeUp} custom={1}>
              <Card>
                <h2 className="text-white text-lg font-semibold mb-4">About</h2>
                <p className="text-[#A0A0A0] text-[15px] leading-relaxed mb-6">
                  {talent.bio}
                </p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.06]">
                  {talent.memberSince && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#666666]" />
                      <span className="text-[#A0A0A0] text-xs">
                        Member since <span className="text-white">{formatMemberSince(talent.memberSince)}</span>
                      </span>
                    </div>
                  )}
                  {talent.profileCompletion && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C6FF34]" />
                      <span className="text-[#A0A0A0] text-xs">
                        Profile <span className="text-[#C6FF34]">{talent.profileCompletion}%</span> complete
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* ── Skills Section ── */}
            <motion.div variants={fadeUp} custom={2}>
              <Card>
                <h2 className="text-white text-lg font-semibold mb-4">Skills</h2>
                {/* Category hint */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#666666] text-xs">Category:</span>
                  <span className="text-[#C6FF34] text-xs font-medium bg-[#C6FF34]/10 border border-[#C6FF34]/20 rounded-full px-3 py-0.5">
                    {talent.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      className="text-[#A0A0A0] text-sm bg-white/5 border border-white/[0.06] rounded-xl px-4 py-2 hover:border-[#C6FF34]/20 hover:text-white transition-all cursor-default"
                      whileHover={{ scale: 1.03 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* ── Portfolio Section ── */}
            {talent.portfolio && talent.portfolio.length > 0 && (
              <motion.div variants={fadeUp} custom={3}>
                <Card>
                  <h2 className="text-white text-lg font-semibold mb-5">Portfolio</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {talent.portfolio.map((item, i) => (
                      <motion.a
                        key={i}
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 hover:border-[#C6FF34]/20 transition-all block"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium text-sm group-hover:text-[#C6FF34] transition-colors">
                            {item.title}
                          </h3>
                          <ExternalLink className="w-3.5 h-3.5 text-[#666666] group-hover:text-[#C6FF34] transition-colors flex-shrink-0" />
                        </div>
                        {item.desc && (
                          <p className="text-[#666666] text-xs leading-relaxed">{item.desc}</p>
                        )}
                      </motion.a>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── Reviews Section ── */}
            {talent.reviews && talent.reviews.length > 0 && (
              <motion.div variants={fadeUp} custom={4}>
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white text-lg font-semibold">Reviews</h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#C6FF34] fill-[#C6FF34]" />
                      <span className="text-white font-display text-xl font-bold">{avgRating}</span>
                      <span className="text-[#666666] text-xs">({talent.reviews.length} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {talent.reviews.map((review, i) => (
                      <motion.div
                        key={i}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Reviewer avatar */}
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(review.reviewer)} flex items-center justify-center text-black text-xs font-bold flex-shrink-0`}
                            >
                              {getInitials(review.reviewer)}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{review.reviewer}</p>
                              <p className="text-[#666666] text-xs">{review.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <StarRating rating={review.rating} size={14} />
                          </div>
                        </div>
                        <p className="text-[#A0A0A0] text-sm leading-relaxed mb-2">
                          {review.comment}
                        </p>
                        <p className="text-[#444444] text-xs">{formatReviewDate(review.date)}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* ── Right Column (1/3) ── */}
          <motion.aside
            className="space-y-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* ── CTA Section ── */}
            <Card>
              <h3 className="text-white font-semibold mb-4">Actions</h3>
              <div className="space-y-2.5">
                {/* Message Button (Lime) */}
                <Link
                  to="/messages"
                  className="w-full py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Link>

                {/* Hire Button (Violet outline) */}
                <Link
                  to={`/booking/${talent.id}`}
                  className="w-full py-3 border border-[#7E3BED] text-[#7E3BED] font-medium rounded-xl hover:bg-[#7E3BED]/10 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Briefcase className="w-4 h-4" />
                  Hire
                </Link>

                {/* Save to Shortlist Button (outline) */}
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    saved
                      ? "border-[#C6FF34]/30 bg-[#C6FF34]/10 text-[#C6FF34]"
                      : "border-white/10 text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {saved ? (
                    <>
                      <Heart className="w-4 h-4 fill-[#C6FF34]" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Save to Shortlist
                    </>
                  )}
                </button>
              </div>
            </Card>

            {/* ── Quick Stats ── */}
            <Card>
              <h3 className="text-white font-semibold mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] text-xs">Tier</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: tierStyle.color }}
                  >
                    {talent.tier}
                  </span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] text-xs">Reviews</span>
                  <span className="text-white text-sm font-medium">{talent.reviews?.length || 0}</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] text-xs">Portfolio</span>
                  <span className="text-white text-sm font-medium">{talent.portfolio?.length || 0} projects</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] text-xs">Skills</span>
                  <span className="text-white text-sm font-medium">{talent.skills.length}</span>
                </div>
              </div>
            </Card>

            {/* ── Rate Card ── */}
            <Card>
              <h3 className="text-white font-semibold mb-2">Rate</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[#C6FF34] text-2xl font-display font-bold">{talent.rate}</span>
              </div>
              <p className="text-[#666666] text-xs mt-2">Negotiable depending on project scope</p>
            </Card>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
