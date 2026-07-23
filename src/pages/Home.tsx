import ParticleField from '@/components/ParticleField';
import HeroSection from '@/sections/home/HeroSection';
import JourneySection from '@/sections/home/JourneySection';
import EcosystemSection from '@/sections/home/EcosystemSection';
import HumanStoriesSection from '@/sections/home/HumanStoriesSection';
import VisionSection from '@/sections/home/VisionSection';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  HOMEPAGE — Cinematic scroll-driven storytelling experience  ║
   ║  Five moments answering five fundamental questions           ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export default function Home() {
  return (
    <div className="relative">
      {/* Persistent ambient particle field */}
      <ParticleField count={40} density="low" />

      {/* Moment 1 — Hero: "Why does Levav exist?" */}
      <HeroSection />

      {/* Moment 2 — The Journey: "How does it work?" */}
      <JourneySection />

      {/* Moment 3 — Ecosystem: "Why is it different?" */}
      <EcosystemSection />

      {/* Moment 4 — Human Stories: "How does it change lives?" */}
      <HumanStoriesSection />

      {/* Moment 5 — Vision: "How does it strengthen Africa?" */}
      <VisionSection />
    </div>
  );
}
