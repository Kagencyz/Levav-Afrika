import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  Code,
  Palette,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Sprout,
  LayoutGrid,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { RateDisplay } from "@/components/CurrencyDisplay";
import { trpc } from "@/providers/trpc";
import { safeJSONParse } from "@/lib/safeJSON";
import { useAuth } from "@/hooks/useAuth";

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
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/* ───────────────────── Categories ───────────────────── */
const categories = [
  { label: "All", icon: LayoutGrid },
  { label: "Technology", icon: Code },
  { label: "Visual Arts", icon: Palette },
  { label: "Business", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Healthcare", icon: HeartPulse },
  { label: "Agriculture", icon: Sprout },
];

/* ───────────────────── Avatar helpers ───────────────────── */
const avatarUrls = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
];

function getAvatar(index: number) {
  return avatarUrls[index % avatarUrls.length];
}

/** Deterministic avatar pick for any id string — real talent ids are UUIDs,
 * not the small integers getAvatar(Number(id)) was written for. */
function getAvatarForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return getAvatar(hash);
}

/* ───────────────────── Mock Talent Data ───────────────────── */
const MOCK_TALENTS = [
  {
    id: "1",
    name: "Mutale Mwanza",
    bio: "Full-stack developer with 6 years experience building fintech platforms across Africa. Passionate about clean code and scalable architecture.",
    category: "Technology",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    location: "Lusaka, Zambia",
    rate: "ZMW 800/hour",
    featured: true,
    wri: 87,
    tier: "Platinum",
    role: "Senior Frontend Developer",
  },
  {
    id: "2",
    name: "Grace Lungu",
    bio: "Award-winning product designer with a focus on accessible, human-centered design for emerging markets.",
    category: "Visual Arts",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
    location: "Ndola, Zambia",
    rate: "ZMW 600/hour",
    featured: true,
    wri: 82,
    tier: "Gold",
    role: "Product Designer",
  },
  {
    id: "3",
    name: "Amara Okafor",
    bio: "Data scientist specializing in predictive analytics for agriculture and healthcare in West Africa.",
    category: "Technology",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Visualization"],
    location: "Lagos, Nigeria",
    rate: "\u20A65,000/hour",
    featured: false,
    wri: 79,
    tier: "Gold",
    role: "Data Scientist",
  },
  {
    id: "4",
    name: "Kofi Mensah",
    bio: "Mobile developer who has shipped 8 apps to the Play Store with over 500K combined downloads.",
    category: "Technology",
    skills: ["React Native", "Flutter", "Firebase", "iOS", "Android"],
    location: "Accra, Ghana",
    rate: "GHS 400/hour",
    featured: false,
    wri: 76,
    tier: "Silver",
    role: "Mobile Developer",
  },
  {
    id: "5",
    name: "Zara Ibrahim",
    bio: "UX researcher with expertise in conducting field studies across East African rural communities.",
    category: "Visual Arts",
    skills: ["User Research", "Interviewing", "Analysis", "Figma", "Personas"],
    location: "Nairobi, Kenya",
    rate: "KES 3,000/hour",
    featured: true,
    wri: 84,
    tier: "Platinum",
    role: "UX Researcher",
  },
  {
    id: "6",
    name: "Tendai Mutasa",
    bio: "Marketing strategist who grew three startups from zero to 100K users in under 12 months.",
    category: "Business",
    skills: ["Marketing", "Growth Hacking", "Social Media", "Analytics", "Copywriting"],
    location: "Harare, Zimbabwe",
    rate: "USD 50/hour",
    featured: false,
    wri: 71,
    tier: "Silver",
    role: "Marketing Strategist",
  },
  {
    id: "7",
    name: "Amina Diallo",
    bio: "DevOps engineer specializing in cloud infrastructure for African tech startups. AWS certified.",
    category: "Technology",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    location: "Dakar, Senegal",
    rate: "CFA 50,000/hour",
    featured: false,
    wri: 80,
    tier: "Gold",
    role: "DevOps Engineer",
  },
  {
    id: "8",
    name: "Chidi Okafor",
    bio: "Backend engineer with deep expertise in building high-throughput payment systems.",
    category: "Technology",
    skills: ["Go", "Python", "Microservices", "Redis", "Kafka"],
    location: "Enugu, Nigeria",
    rate: "\u20A66,000/hour",
    featured: false,
    wri: 75,
    tier: "Gold",
    role: "Backend Engineer",
  },
  {
    id: "9",
    name: "Pastor James Mwale",
    bio: "Community leader and pastoral counselor with 15 years experience in youth development programs.",
    category: "Education",
    skills: ["Counseling", "Public Speaking", "Leadership", "Community Organizing", "Training"],
    location: "Lusaka, Zambia",
    rate: "Negotiable",
    featured: false,
    wri: 88,
    tier: "Gold",
    role: "Pastoral Counselor",
  },
  {
    id: "10",
    name: "Fatima Said",
    bio: "Agricultural engineer developing sustainable farming technologies for arid regions.",
    category: "Agriculture",
    skills: ["Agriculture", "Irrigation", "Soil Science", "Project Management", "Data Analysis"],
    location: "Dar es Salaam, Tanzania",
    rate: "TZS 100,000/hour",
    featured: false,
    wri: 73,
    tier: "Silver",
    role: "Agricultural Engineer",
  },
  {
    id: "11",
    name: "Nia Johnson",
    bio: "AI researcher working on natural language processing for African languages. Published 12 papers.",
    category: "Technology",
    skills: ["AI/ML", "Python", "NLP", "PyTorch", "Research"],
    location: "Kigali, Rwanda",
    rate: "USD 80/hour",
    featured: true,
    wri: 91,
    tier: "Platinum",
    role: "AI Researcher",
  },
  {
    id: "12",
    name: "Dr. Omar Hassan",
    bio: "Public health specialist focused on maternal health programs across North Africa.",
    category: "Healthcare",
    skills: ["Public Health", "Epidemiology", "Research", "Program Management", "Data Analysis"],
    location: "Cairo, Egypt",
    rate: "EGP 1,500/hour",
    featured: false,
    wri: 85,
    tier: "Gold",
    role: "Public Health Specialist",
  },
];

/* ───────────────────── TalentCard ───────────────────── */
function TalentCard({
  talent,
  index,
}: {
  talent: {
    id: string;
    name: string;
    bio: string | null;
    category: string;
    skills: string[];
    location: string | null;
    rate: string | null;
    featured: boolean | null;
    wri?: number;
    tier?: string;
    role?: string;
    avatar?: string | null;
  };
  index: number;
}) {
  const { notifyProfileViewed } = useNotifications();

  return (
    <motion.div variants={fadeUp} custom={index}>
      <Link
        to={`/talent/${talent.id}`}
        onClick={() => notifyProfileViewed(talent.name)}
        className="block bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={talent.avatar ?? getAvatarForId(talent.id)}
            alt={talent.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {talent.featured && (
            <div className="absolute top-3 right-3 bg-[#C6FF34]/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-black fill-black" />
              <span className="text-black text-xs font-medium">Featured</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="text-[#C6FF34] text-xs font-medium bg-[#C6FF34]/10 border border-[#C6FF34]/20 rounded-full px-3 py-1">
              {talent.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-white text-lg font-semibold mb-1 group-hover:text-[#C6FF34] transition-colors">
            {talent.name}
          </h3>
          {talent.role && (
            <p className="text-[#C6FF34] text-xs font-medium mb-2">{talent.role}</p>
          )}
          <p className="text-[#A0A0A0] text-sm mb-3 line-clamp-2">{talent.bio ?? ""}</p>

          <div className="flex items-center gap-1.5 text-[#666666] text-xs mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {talent.location ?? "Remote"}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {talent.skills?.map((skill) => (
              <span
                key={skill}
                className="text-[#A0A0A0] text-xs bg-white/5 border border-white/[0.06] rounded-lg px-2.5 py-1"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Rate & WRI */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            {talent.rate && (
              <RateDisplay rate={talent.rate} showConverted />
            )}
            {talent.wri && (
              <span className="text-[#666666] text-xs bg-white/5 rounded-lg px-2 py-1">
                WRI: <span className="text-[#C6FF34] font-medium">{talent.wri}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ───────────────────── TalentDirectory Page ───────────────────── */
export default function TalentDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Real profiles, backed by the database — every visitor sees these, not
  // just the browser that created them. Generous limit since this is still
  // prototype-scale; paginate for real once volume warrants it.
  const { isAuthenticated } = useAuth();
  const { data: realTalentsPage } = trpc.talent.list.useQuery({ limit: 100 });
  const { data: ownProfile } = trpc.talent.getOwnProfile.useQuery(undefined, { enabled: isAuthenticated });

  // Merge real + mock talents
  const talents = useMemo(() => {
    // rate/portfolio/avatar have no backend column yet (db/schema.ts) — only
    // the current browser's own profile can show them, from local storage.
    const extras = safeJSONParse<{ rate?: string; avatar?: string }>("talent_profile_extras", {});

    const realTalents = (realTalentsPage?.talents ?? []).map((t) => ({
      ...t,
      category: t.category ?? "General",
      role: t.category ?? undefined,
      featured: false,
      wri: undefined as number | undefined,
      tier: undefined as string | undefined,
      rate: t.id === ownProfile?.id ? extras.rate ?? null : null,
      avatar: t.id === ownProfile?.id ? extras.avatar ?? null : null,
    }));

    const allTalents = [...realTalents, ...MOCK_TALENTS];

    let result = [...allTalents];

    if (activeFilter !== "All") {
      result = result.filter((t) => t.category === activeFilter);
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.bio?.toLowerCase().includes(term) ||
          t.skills.some((s: string) => s.toLowerCase().includes(term)) ||
          t.location?.toLowerCase().includes(term) ||
          t.role?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [searchQuery, activeFilter, realTalentsPage, ownProfile]);

  const totalCount = talents.length;

  return (
    <main className="bg-black min-h-screen">
      <Hero />

      {/* Search & Filters */}
      <section className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] py-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Search Bar */}
          <motion.div
            className="relative mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by name, role, or skill..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34] transition-colors text-[15px]"
            />
          </motion.div>

          {/* Category Chips */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveFilter(cat.label);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === cat.label
                    ? "bg-[#C6FF34] text-black"
                    : "bg-white/5 border border-white/[0.06] text-[#A0A0A0] hover:bg-white/10 hover:text-white"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Result Count */}
          <div className="mt-4 text-sm text-[#666666]">
            Showing <span className="text-[#C6FF34]">{totalCount} talents</span>
          </div>
        </div>
      </section>

      {/* Talent Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Talent Cards */}
          {talents.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {talents.map((talent, i) => (
                <TalentCard key={talent.id} talent={talent} index={i} />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {talents.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-12 h-12 text-[#666666] mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">No talents found</h3>
              <p className="text-[#666666] mb-6">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
                className="px-6 py-3 bg-[#C6FF34] text-black font-medium rounded-xl hover:bg-[#d4ff5c] transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ───────────────────── Hero ───────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-black pt-24 pb-12">
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.span
          className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-6 block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          Talent Pool
        </motion.span>
        <motion.h1
          className="font-display text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.08] sm:leading-[1.05] mb-6 break-words"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
            Exceptional
          </span>{" "}
          Talent
        </motion.h1>
        <motion.p
          className="text-[#A0A0A0] text-lg max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.19, 1, 0.22, 1] }}
        >
          Browse verified, workforce-ready talent from across the African continent.
        </motion.p>
      </div>
    </section>
  );
}
