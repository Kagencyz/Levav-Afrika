import { db } from './connection';
import { categories, talents } from './schema';
import { sql } from 'drizzle-orm';

const CATEGORIES = [
  { name: 'Music', slug: 'music', description: 'Vocalists, instrumentalists, producers, and composers across all genres.', icon: 'Music' },
  { name: 'Dance', slug: 'dance', description: 'Traditional, contemporary, hip-hop, and choreographed dance performers.', icon: 'Dance' },
  { name: 'Technology', slug: 'technology', description: 'Software developers, data scientists, AI specialists, and tech consultants.', icon: 'Code' },
  { name: 'Visual Arts', slug: 'visual-arts', description: 'Painters, sculptors, illustrators, photographers, and digital artists.', icon: 'Palette' },
  { name: 'Writing', slug: 'writing', description: 'Poets, novelists, scriptwriters, copywriters, and journalists.', icon: 'Pen' },
  { name: 'Skilled Trades', slug: 'skilled-trades', description: 'Carpenters, electricians, tailors, chefs, and other master craftspeople.', icon: 'Wrench' },
];

const TALENTS = [
  {
    name: 'Amara Okafor',
    bio: 'Award-winning Afrobeat vocalist and songwriter with over 10 years of stage experience. Known for blending traditional Igbo melodies with contemporary sounds.',
    category: 'Music',
    skills: ['Vocals', 'Songwriting', 'Piano', 'Stage Performance'],
    portfolio: ['https://example.com/amara-1.jpg', 'https://example.com/amara-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    location: 'Lagos, Nigeria',
    rate: '$200 - $500 per event',
    featured: true,
  },
  {
    name: 'Kofi Mensah',
    bio: 'Master drummer and percussionist specializing in traditional Ghanaian rhythms. Has performed at festivals across West Africa and Europe.',
    category: 'Music',
    skills: ['Drumming', 'Percussion', 'Teaching', 'Cultural Performance'],
    portfolio: ['https://example.com/kofi-1.jpg', 'https://example.com/kofi-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    location: 'Accra, Ghana',
    rate: '$150 - $400 per event',
    featured: true,
  },
  {
    name: 'Zara Ibrahim',
    bio: 'Contemporary dancer and choreographer fusing North African dance styles with modern ballet. Founder of the Cairo Movement Collective.',
    category: 'Dance',
    skills: ['Contemporary Dance', 'Choreography', 'Ballet', 'Hip-Hop'],
    portfolio: ['https://example.com/zara-1.jpg', 'https://example.com/zara-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    location: 'Nairobi, Kenya',
    rate: '$250 - $600 per performance',
    featured: true,
  },
  {
    name: 'Thabo Molefe',
    bio: 'Full-stack developer and AI researcher building solutions for African enterprises. Expert in Python, TensorFlow, and cloud architecture.',
    category: 'Technology',
    skills: ['Python', 'Machine Learning', 'React', 'Node.js', 'AWS'],
    portfolio: ['https://github.com/thabom', 'https://thabomolefe.dev'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    location: 'Johannesburg, South Africa',
    rate: '$75 - $120 per hour',
    featured: true,
  },
  {
    name: 'Priya Nair',
    bio: 'Oil painter and mixed-media artist exploring themes of identity and migration. Exhibited works in galleries across East Africa and India.',
    category: 'Visual Arts',
    skills: ['Oil Painting', 'Mixed Media', 'Art Direction', 'Exhibition Design'],
    portfolio: ['https://example.com/priya-1.jpg', 'https://example.com/priya-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    location: 'Nairobi, Kenya',
    rate: '$300 - $800 per commission',
    featured: false,
  },
  {
    name: 'Jean-Pierre Mbaye',
    bio: 'Professional photographer and videographer specializing in portraits, events, and documentary filmmaking across Central Africa.',
    category: 'Visual Arts',
    skills: ['Photography', 'Videography', 'Editing', 'Drone Operation'],
    portfolio: ['https://example.com/jp-1.jpg', 'https://example.com/jp-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    location: 'Kinshasa, DRC',
    rate: '$200 - $500 per shoot',
    featured: false,
  },
  {
    name: 'Amina Diallo',
    bio: 'Spoken word poet and novelist whose work centers on social justice, womanhood, and the African diaspora experience. Published 3 collections.',
    category: 'Writing',
    skills: ['Poetry', 'Creative Writing', 'Spoken Word', 'Editing'],
    portfolio: ['https://example.com/amina-1.jpg', 'https://example.com/amina-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    location: 'Dakar, Senegal',
    rate: '$100 - $300 per session',
    featured: false,
  },
  {
    name: 'Oluwaseun Adeyemi',
    bio: 'Master tailor and fashion designer creating contemporary African-inspired clothing. Over 15 years of experience in bespoke garment making.',
    category: 'Skilled Trades',
    skills: ['Tailoring', 'Fashion Design', 'Pattern Making', 'Styling'],
    portfolio: ['https://example.com/seun-1.jpg', 'https://example.com/seun-2.jpg'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    location: 'Lagos, Nigeria',
    rate: '$150 - $400 per piece',
    featured: false,
  },
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await db
      .insert(categories)
      .values(cat)
      .onDuplicateKeyUpdate({
        set: {
          name: sql`VALUES(name)`,
          description: sql`VALUES(description)`,
          icon: sql`VALUES(icon)`,
        },
      });
  }
  console.log(`Inserted ${CATEGORIES.length} categories.`);

  console.log('Seeding talents...');
  for (const t of TALENTS) {
    await db
      .insert(talents)
      .values({
        userId: null,
        name: t.name,
        bio: t.bio,
        category: t.category,
        skills: t.skills,
        portfolio: t.portfolio,
        avatar: t.avatar,
        location: t.location,
        rate: t.rate,
        featured: t.featured,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: sql`VALUES(name)`,
          bio: sql`VALUES(bio)`,
          category: sql`VALUES(category)`,
          skills: sql`VALUES(skills)`,
          portfolio: sql`VALUES(portfolio)`,
          avatar: sql`VALUES(avatar)`,
          location: sql`VALUES(location)`,
          rate: sql`VALUES(rate)`,
          featured: sql`VALUES(featured)`,
        },
      });
  }
  console.log(`Inserted ${TALENTS.length} talents.`);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
