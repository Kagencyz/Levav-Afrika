import ParticleField from '@/components/ParticleField';
import HeroSection from '@/sections/home/HeroSection';
import PathsSection from '@/sections/home/PathsSection';
import JourneySection from '@/sections/home/JourneySection';
import EcosystemSection from '@/sections/home/EcosystemSection';
import Levav28PathwaysSection from '@/sections/home/Levav28PathwaysSection';
import FeedPreviewSection from '@/sections/home/FeedPreviewSection';
import ProfilePreviewSection from '@/sections/home/ProfilePreviewSection';
import HumanStoriesSection from '@/sections/home/HumanStoriesSection';
import VisionSection from '@/sections/home/VisionSection';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  HOMEPAGE — Cinematic scroll-driven storytelling experience  ║
   ║  Layout per docs/UPGRADE_BRIEF.md §2: one primary free-      ║
   ║  account CTA, path choice, previews, trust, final signup.    ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export default function Home() {
  return (
    <div className="relative">
      {/* Persistent ambient particle field */}
      <ParticleField count={40} density="low" />

      {/* Hero: "Why does Levav exist?" — primary Create a Free Account CTA */}
      <HeroSection />

      {/* Path choice: talent, work, hiring, gigs, volunteering, courses, community */}
      <PathsSection />

      {/* The Journey: "How does it work?" */}
      <JourneySection />

      {/* Ecosystem: "Why is it different?" */}
      <EcosystemSection />

      {/* Levav 28 for employed and unemployed users */}
      <Levav28PathwaysSection />

      {/* Professional feed + verified opportunities preview */}
      <FeedPreviewSection />

      {/* Levav ID / WRI / work evidence preview + employers + trust signals */}
      <ProfilePreviewSection />

      {/* Human Stories: "How does it change lives?" */}
      <HumanStoriesSection />

      {/* Vision + final signup CTA: "How does it strengthen Africa?" */}
      <VisionSection />
    </div>
  );
}
