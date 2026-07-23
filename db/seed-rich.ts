import { db } from './connection';
import {
  users,
  talents,
  categories,
  employers,
  jobs,
  applications,
  messages,
  reviews,
  wriScores,
  notifications,
} from './schema';
import bcryptjs from 'bcryptjs';

const PASSWORD_HASH = bcryptjs.hashSync('password123', 10);
const ADMIN_HASH = bcryptjs.hashSync('admin123', 10);

async function seed() {
  console.log('🌱 Starting rich database seed...');

  // ── Clear existing data in reverse dependency order ──
  console.log('  Clearing existing data...');
  await db.delete(notifications);
  await db.delete(wriScores);
  await db.delete(reviews);
  await db.delete(messages);
  await db.delete(applications);
  await db.delete(jobs);
  await db.delete(employers);
  await db.delete(talents);
  await db.delete(categories);
  await db.delete(users);
  console.log('  All tables cleared.');

  // ── 1. Users (15) ──
  console.log('  Seeding users...');
  const usersData = [
    { email: 'mutale@levav.co.zm', passwordHash: PASSWORD_HASH, name: 'Mutale Mwanza', role: 'talent' as const },
    { email: 'grace@levav.co.zm', passwordHash: PASSWORD_HASH, name: 'Grace Lungu', role: 'talent' as const },
    { email: 'amara@levav.ng', passwordHash: PASSWORD_HASH, name: 'Amara Okafor', role: 'talent' as const },
    { email: 'kofi@levav.co.gh', passwordHash: PASSWORD_HASH, name: 'Kofi Mensah', role: 'talent' as const },
    { email: 'zara@levav.co.ke', passwordHash: PASSWORD_HASH, name: 'Zara Ibrahim', role: 'talent' as const },
    { email: 'tendai@levav.co.zw', passwordHash: PASSWORD_HASH, name: 'Tendai Mutasa', role: 'talent' as const },
    { email: 'amina@levav.co.sn', passwordHash: PASSWORD_HASH, name: 'Amina Diallo', role: 'talent' as const },
    { email: 'chidi@levav.ng', passwordHash: PASSWORD_HASH, name: 'Chidi Okafor', role: 'talent' as const },
    { email: 'fatima@levav.co.tz', passwordHash: PASSWORD_HASH, name: 'Fatima Said', role: 'talent' as const },
    { email: 'pastor.james@levav.co.zm', passwordHash: PASSWORD_HASH, name: 'Pastor James Mwale', role: 'talent' as const },
    { email: 'nia@levav.co.rw', passwordHash: PASSWORD_HASH, name: 'Nia Johnson', role: 'talent' as const },
    { email: 'omar@levav.co.eg', passwordHash: PASSWORD_HASH, name: 'Dr. Omar Hassan', role: 'talent' as const },
    { email: 'hr@bongohive.co.zm', passwordHash: PASSWORD_HASH, name: 'John Banda', role: 'client' as const },
    { email: 'careers@mpharma.com', passwordHash: PASSWORD_HASH, name: 'Gregory Rockson', role: 'client' as const },
    { email: 'admin@levav.africa', passwordHash: ADMIN_HASH, name: 'Levav Admin', role: 'admin' as const },
  ];

  const insertedUsers = await db.insert(users).values(usersData);
  const firstUserId = Number(insertedUsers[0].insertId);
  console.log(`  Inserted ${usersData.length} users (IDs ${firstUserId} - ${firstUserId + usersData.length - 1})`);

  // Helper to get user ID by index
  const uid = (idx: number) => firstUserId + idx; // 0-based index

  // ── 2. Categories (8) ──
  console.log('  Seeding categories...');
  const categoriesData = [
    { name: 'Technology', slug: 'technology', description: 'Software developers, data scientists, AI specialists, and tech consultants building Africa\'s digital future.', icon: 'Code' },
    { name: 'Visual Arts', slug: 'visual-arts', description: 'Painters, sculptors, illustrators, photographers, and digital artists creating stunning visual narratives.', icon: 'Palette' },
    { name: 'Music', slug: 'music', description: 'Vocalists, instrumentalists, producers, and composers across all genres from Afrobeat to Amapiano.', icon: 'Music' },
    { name: 'Dance', slug: 'dance', description: 'Traditional, contemporary, hip-hop, and choreographed dance performers bringing rhythm to life.', icon: 'Dance' },
    { name: 'Writing', slug: 'writing', description: 'Poets, novelists, scriptwriters, copywriters, and journalists telling Africa\'s stories.', icon: 'Pen' },
    { name: 'Skilled Trades', slug: 'skilled-trades', description: 'Carpenters, electricians, tailors, chefs, and other master craftspeople keeping traditions alive.', icon: 'Wrench' },
    { name: 'Healthcare', slug: 'healthcare', description: 'Doctors, nurses, therapists, and public health professionals caring for communities across the continent.', icon: 'Heart' },
    { name: 'Agriculture', slug: 'agriculture', description: 'Agripreneurs, farm managers, agronomists, and sustainable farming experts feeding the nation.', icon: 'Leaf' },
  ];
  await db.insert(categories).values(categoriesData);
  console.log(`  Inserted ${categoriesData.length} categories`);

  // ── 3. Talents (12 profiles linked to talent users) ──
  console.log('  Seeding talents...');
  const talentsData = [
    {
      userId: uid(0),
      name: 'Mutale Mwanza',
      bio: 'Award-winning software engineer and full-stack developer from Lusaka. Specializes in building fintech solutions for underserved African markets with 8+ years of experience in React, Node.js, and cloud architecture. Led engineering teams at two successful Zambian startups.',
      category: 'Technology',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Fintech'],
      portfolio: ['https://github.com/mutale-mwanza', 'https://mutale.dev/portfolio', 'https://dev.to/mutale'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      location: 'Lusaka, Zambia',
      rate: 'ZMW 800 - 1,500 per hour',
      featured: true,
    },
    {
      userId: uid(1),
      name: 'Grace Lungu',
      bio: 'Contemporary visual artist blending traditional Zambian motifs with modern acrylic techniques. Her work has been exhibited at the Lusaka National Museum and galleries across Southern Africa. Specializes in large-scale murals and commissioned portraits.',
      category: 'Visual Arts',
      skills: ['Acrylic Painting', 'Mural Art', 'Portrait Drawing', 'Digital Illustration', 'Art Direction'],
      portfolio: ['https://gracelungu.art/gallery', 'https://instagram.com/grace.lungu.art'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      location: 'Lusaka, Zambia',
      rate: 'ZMW 5,000 - 15,000 per piece',
      featured: true,
    },
    {
      userId: uid(2),
      name: 'Amara Okafor',
      bio: 'Afrobeat vocalist and songwriter with over 10 years of stage experience. Known for blending traditional Igbo melodies with contemporary sounds. Has performed at Felabration, Afro Nation, and numerous international festivals. Released two critically acclaimed albums.',
      category: 'Music',
      skills: ['Vocals', 'Songwriting', 'Piano', 'Stage Performance', 'Music Production'],
      portfolio: ['https://amaraokafor.com/music', 'https://youtube.com/amaraokafor'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      location: 'Lagos, Nigeria',
      rate: 'NGN 300,000 - 800,000 per event',
      featured: true,
    },
    {
      userId: uid(3),
      name: 'Kofi Mensah',
      bio: 'Master drummer and percussionist specializing in traditional Ghanaian rhythms from the Ashanti region. Has performed at festivals across West Africa and Europe. Teaches drumming workshops to youth, preserving cultural heritage through music education.',
      category: 'Music',
      skills: ['Drumming', 'Percussion', 'Teaching', 'Cultural Performance', 'Djembe'],
      portfolio: ['https://kofimensah.com', 'https://youtube.com/kofimensah'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      location: 'Accra, Ghana',
      rate: 'GHS 2,000 - 5,000 per event',
      featured: false,
    },
    {
      userId: uid(4),
      name: 'Zara Ibrahim',
      bio: 'Contemporary dancer and choreographer fusing North African dance styles with modern ballet. Founder of the Nairobi Movement Collective, a dance school empowering young women through performance art. Former principal dancer at the National Theatre.',
      category: 'Dance',
      skills: ['Contemporary Dance', 'Choreography', 'Ballet', 'Hip-Hop', 'Traditional African Dance'],
      portfolio: ['https://nairobimovement.co.ke', 'https://instagram.com/zara.ibrahim'],
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
      location: 'Nairobi, Kenya',
      rate: 'KES 25,000 - 60,000 per performance',
      featured: true,
    },
    {
      userId: uid(5),
      name: 'Tendai Mutasa',
      bio: 'Spoken word poet and creative writer whose work explores identity, displacement, and the Zimbabwean experience. Winner of the NAMA Award for Outstanding Literature. Published three poetry collections and a novel shortlisted for the Caine Prize.',
      category: 'Writing',
      skills: ['Poetry', 'Creative Writing', 'Spoken Word', 'Editing', ' storytelling'],
      portfolio: ['https://tendaimutasa.com', 'https://medium.com/@tendai'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      location: 'Harare, Zimbabwe',
      rate: 'USD 150 - 400 per session',
      featured: false,
    },
    {
      userId: uid(6),
      name: 'Amina Diallo',
      bio: 'Master tailor and fashion designer creating contemporary African-inspired clothing. Over 15 years of experience in bespoke garment making. Her designs have been showcased at Dakar Fashion Week and featured in Elle South Africa.',
      category: 'Skilled Trades',
      skills: ['Tailoring', 'Fashion Design', 'Pattern Making', 'Styling', 'Textile Design'],
      portfolio: ['https://aminadiallo.sn/collections', 'https://instagram.com/amina.diallo'],
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      location: 'Dakar, Senegal',
      rate: 'XOF 75,000 - 200,000 per piece',
      featured: true,
    },
    {
      userId: uid(7),
      name: 'Chidi Okafor',
      bio: 'Full-stack developer and AI researcher building solutions for African enterprises. Expert in Python, TensorFlow, and cloud architecture. Co-founder of an AgriTech startup that connects smallholder farmers to markets using machine learning.',
      category: 'Technology',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'React', 'Node.js', 'AWS'],
      portfolio: ['https://github.com/chidiokafor', 'https://chidiokafor.dev'],
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      location: 'Lagos, Nigeria',
      rate: 'NGN 50,000 - 100,000 per hour',
      featured: true,
    },
    {
      userId: uid(8),
      name: 'Fatima Said',
      bio: 'Registered nurse and public health specialist with a passion for community healthcare in East Africa. 10+ years experience managing maternal health programs in rural Tanzania. Certified midwife and health educator.',
      category: 'Healthcare',
      skills: ['Nursing', 'Public Health', 'Midwifery', 'Health Education', 'Community Outreach'],
      portfolio: ['https://linkedin.com/in/fatima-said'],
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      location: 'Dar es Salaam, Tanzania',
      rate: 'TZS 100,000 - 200,000 per day',
      featured: false,
    },
    {
      userId: uid(9),
      name: 'Pastor James Mwale',
      bio: 'Gospel music minister, worship leader, and vocal coach with a heart for unity across denominations. Has released five albums and toured across Southern Africa. Runs a music academy training the next generation of gospel artists.',
      category: 'Music',
      skills: ['Gospel Vocals', 'Songwriting', 'Music Direction', 'Vocal Coaching', 'Piano'],
      portfolio: ['https://pstrjamesmwale.org', 'https://spotify.com/pstrjames'],
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      location: 'Ndola, Zambia',
      rate: 'ZMW 3,000 - 8,000 per event',
      featured: false,
    },
    {
      userId: uid(10),
      name: 'Nia Johnson',
      bio: 'Sustainable agriculture expert and farm manager specializing in organic farming and permaculture. Manages a 50-hectare farm in Rwanda\'s Eastern Province, exporting fresh produce to Europe. Trainer in climate-smart agriculture practices.',
      category: 'Agriculture',
      skills: ['Farm Management', 'Organic Farming', 'Permaculture', 'Agribusiness', 'Export Logistics'],
      portfolio: ['https://greenrwanda.rw/farms', 'https://linkedin.com/in/nia-johnson'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      location: 'Kigali, Rwanda',
      rate: 'RWF 150,000 - 350,000 per day',
      featured: true,
    },
    {
      userId: uid(11),
      name: 'Dr. Omar Hassan',
      bio: 'Cardiologist and digital health innovator based in Cairo. Combines 12 years of clinical practice with healthtech entrepreneurship. Built a telemedicine platform serving 200,000+ patients across North Africa. Published researcher in cardiovascular medicine.',
      category: 'Healthcare',
      skills: ['Cardiology', 'Telemedicine', 'Digital Health', 'Medical Research', 'Public Speaking'],
      portfolio: ['https://drhassan.eg/telehealth', 'https://researchgate.net/omar-hassan'],
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
      location: 'Cairo, Egypt',
      rate: 'EGP 3,000 - 6,000 per consultation',
      featured: true,
    },
  ];

  const insertedTalents = await db.insert(talents).values(talentsData);
  const firstTalentId = Number(insertedTalents[0].insertId);
  console.log(`  Inserted ${talentsData.length} talents (IDs ${firstTalentId} - ${firstTalentId + talentsData.length - 1})`);

  // Helper to get talent ID by index
  const tid = (idx: number) => firstTalentId + idx;

  // ── 4. Employers (8) ──
  console.log('  Seeding employers...');
  const employersData = [
    {
      userId: uid(12),
      companyName: 'BongoHive',
      registrationNumber: 'BP/1234/2011',
      industry: 'Technology',
      companySize: '11-50 employees',
      website: 'https://bongohive.co.zm',
      description: 'Zambia\'s first technology and innovation hub, providing co-working space, mentorship, and training for tech entrepreneurs. Founded in 2011, BongoHive has supported over 200 startups and trained 5,000+ developers.',
      logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop',
      businessAddress: 'Plot 397A, Church Road, Lusaka',
      city: 'Lusaka',
      country: 'Zambia',
      contactName: 'John Banda',
      contactTitle: 'HR Manager',
      contactEmail: 'hr@bongohive.co.zm',
      contactPhone: '+260 211 268 000',
      verificationStatus: 'verified' as const,
    },
    {
      userId: uid(13),
      companyName: 'MPharma',
      registrationNumber: 'C-1234567',
      industry: 'Healthcare',
      companySize: '501-1000 employees',
      website: 'https://mpharma.com',
      description: 'MPharma is a technology-driven healthcare company building the infrastructure for Africa\'s pharmaceutical industry. Operating in 9 African countries, MPharma connects patients with affordable, quality medications through its network of 400+ partner pharmacies.',
      logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      businessAddress: '14th Lane, Osu RE, Accra',
      city: 'Accra',
      country: 'Ghana',
      contactName: 'Gregory Rockson',
      contactTitle: 'Chief Executive Officer',
      contactEmail: 'careers@mpharma.com',
      contactPhone: '+233 30 242 0000',
      verificationStatus: 'verified' as const,
    },
    {
      userId: uid(0),
      companyName: 'Flutterwave',
      registrationNumber: 'RC 1234567',
      industry: 'Technology',
      companySize: '501-1000 employees',
      website: 'https://flutterwave.com',
      description: 'Flutterwave is a global payments technology company that enables businesses to accept payments from customers across Africa and beyond. Processing over $1 billion annually, Flutterwave powers growth for 500,000+ businesses.',
      logo: 'https://images.unsplash.com/photo-1553729459-afe8c2fc86e4?w=400&h=400&fit=crop',
      businessAddress: '8 Providence Street, Lekki Phase 1',
      city: 'Lagos',
      country: 'Nigeria',
      contactName: 'Olugbenga Agboola',
      contactTitle: 'Founder & CEO',
      contactEmail: 'talent@flutterwave.com',
      contactPhone: '+234 1 700 0000',
      verificationStatus: 'verified' as const,
    },
    {
      userId: uid(3),
      companyName: 'Andela',
      registrationNumber: 'C-7654321',
      industry: 'Technology',
      companySize: '1001-5000 employees',
      website: 'https://andela.com',
      description: 'Andela is a global talent network that connects companies with vetted, remote engineers from Africa and beyond. With a community of 100,000+ technologists, Andela helps companies build high-performing engineering teams.',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop',
      businessAddress: 'Westlands Business Park, Nairobi',
      city: 'Nairobi',
      country: 'Kenya',
      contactName: 'Jeremy Johnson',
      contactTitle: 'Chief Executive Officer',
      contactEmail: 'talent@andela.com',
      contactPhone: '+254 20 221 0000',
      verificationStatus: 'verified' as const,
    },
    {
      userId: uid(4),
      companyName: 'Zambeef',
      registrationNumber: 'BP/5678/1994',
      industry: 'Agriculture',
      companySize: '1001-5000 employees',
      website: 'https://zambeef.co.zm',
      description: 'Zambeef Products PLC is one of the largest agri-businesses in Zambia and the region. With vertically integrated operations spanning farming, processing, and retail, Zambeef feeds millions across Southern Africa through its chain of 200+ retail outlets.',
      logo: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop',
      businessAddress: 'Plot 8814, Buyantanshi Road, Heavy Industrial Area',
      city: 'Lusaka',
      country: 'Zambia',
      contactName: 'Faith Mukutu',
      contactTitle: 'Managing Director',
      contactEmail: 'careers@zambeef.co.zm',
      contactPhone: '+260 211 369 000',
      verificationStatus: 'verified' as const,
    },
    {
      userId: uid(5),
      companyName: 'Sunbird Bioenergy',
      registrationNumber: 'C-9876543',
      industry: 'Agriculture',
      companySize: '201-500 employees',
      website: 'https://sunbirdbioenergy.com',
      description: 'Sunbird Bioenergy is Africa\'s leading renewable energy company, producing ethanol from cassava to power a sustainable future. Operating large-scale farms and processing facilities in Sierra Leone and Zambia, creating thousands of rural jobs.',
      logo: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=400&fit=crop',
      businessAddress: 'Makeni Town, Bombali District',
      city: 'Makeni',
      country: 'Sierra Leone',
      contactName: 'Richard Bennett',
      contactTitle: 'HR Director',
      contactEmail: 'careers@sunbirdbioenergy.com',
      contactPhone: '+232 76 000 000',
      verificationStatus: 'in_review' as const,
    },
    {
      userId: uid(6),
      companyName: 'GreenFingers Africa',
      registrationNumber: 'BN/2019/001234',
      industry: 'Agriculture',
      companySize: '11-50 employees',
      website: 'https://greenfingersafrica.org',
      description: 'GreenFingers Africa is a social enterprise empowering youth and women through urban farming training and technology. Operating rooftop farms across Dakar and providing fresh produce to local restaurants and markets.',
      logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      businessAddress: 'Sacré-Cœur 3, Dakar',
      city: 'Dakar',
      country: 'Senegal',
      contactName: 'Aissatou Diop',
      contactTitle: 'Founder & CEO',
      contactEmail: 'hello@greenfingersafrica.org',
      contactPhone: '+221 33 825 0000',
      verificationStatus: 'pending' as const,
    },
    {
      userId: uid(7),
      companyName: 'EduBridge Zambia',
      registrationNumber: 'BP/2020/004567',
      industry: 'Education',
      companySize: '51-200 employees',
      website: 'https://edubridge.co.zm',
      description: 'EduBridge Zambia connects talented Zambian professionals with remote work opportunities globally. Offering skills training, mentorship, and job placement services, EduBridge has helped 2,000+ Zambians access dignified digital work.',
      logo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop',
      businessAddress: 'Manda Hill Office Park, Great East Road',
      city: 'Lusaka',
      country: 'Zambia',
      contactName: 'Lubinda Haabazoka',
      contactTitle: 'Head of Partnerships',
      contactEmail: 'talent@edubridge.co.zm',
      contactPhone: '+260 211 234 567',
      verificationStatus: 'verified' as const,
    },
  ];

  const insertedEmployers = await db.insert(employers).values(employersData);
  const firstEmployerId = Number(insertedEmployers[0].insertId);
  console.log(`  Inserted ${employersData.length} employers (IDs ${firstEmployerId} - ${firstEmployerId + employersData.length - 1})`);

  // Helper to get employer ID by index
  const eid = (idx: number) => firstEmployerId + idx;

  // ── 5. Jobs (12) ──
  console.log('  Seeding jobs...');
  const jobsData = [
    {
      employerId: eid(0),
      title: 'Senior Full-Stack Developer',
      description: 'BongoHive is seeking an experienced full-stack developer to lead our incubator platform rebuild. You will architect and build scalable web applications that support Zambia\'s startup ecosystem, mentor junior developers, and contribute to open-source projects.',
      requirements: '5+ years experience with React, Node.js, and PostgreSQL. Experience with cloud infrastructure (AWS/GCP). Leadership experience preferred. Bachelor\'s degree in Computer Science or equivalent.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript', 'System Design'],
      type: 'full-time' as const,
      location: 'Lusaka, Zambia',
      salary: 'ZMW 25,000 - 40,000 per month',
      status: 'active' as const,
      featured: true,
    },
    {
      employerId: eid(0),
      title: 'UI/UX Designer',
      description: 'Join BongoHive\'s design team to create intuitive digital experiences for our startup incubator platform and training programs. You will conduct user research, create wireframes, and design pixel-perfect interfaces.',
      requirements: '3+ years of UI/UX design experience. Proficiency in Figma and Adobe Creative Suite. Portfolio demonstrating user-centered design process. Experience with design systems.',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe XD'],
      type: 'contract' as const,
      location: 'Lusaka, Zambia',
      salary: 'ZMW 15,000 - 25,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(1),
      title: 'Supply Chain Analyst',
      description: 'MPharma needs a data-driven Supply Chain Analyst to optimize our pharmaceutical distribution network across 9 African countries. You will analyze demand patterns, reduce stockouts, and ensure life-saving medications reach patients on time.',
      requirements: 'Bachelor\'s degree in Supply Chain, Logistics, or related field. 3+ years experience in supply chain analytics. Proficiency in Excel, SQL, and data visualization tools. Experience in healthcare or FMCG preferred.',
      skills: ['SQL', 'Data Analysis', 'Supply Chain', 'Excel', 'Tableau', 'Forecasting'],
      type: 'full-time' as const,
      location: 'Accra, Ghana',
      salary: 'GHS 12,000 - 18,000 per month',
      status: 'active' as const,
      featured: true,
    },
    {
      employerId: eid(1),
      title: 'Pharmacy Operations Manager',
      description: 'Lead pharmacy operations for MPharma\'s partner network in Ghana. You will ensure compliance with pharmaceutical regulations, train pharmacy staff on our technology platform, and drive operational excellence across 50+ partner locations.',
      requirements: 'Degree in Pharmacy or Pharmacology. 5+ years in pharmacy operations. Strong leadership and training skills. Knowledge of Ghana FDA regulations.',
      skills: ['Pharmacy Management', 'Regulatory Compliance', 'Training', 'Operations', 'Leadership'],
      type: 'full-time' as const,
      location: 'Accra, Ghana',
      salary: 'GHS 15,000 - 22,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(2),
      title: 'Senior Backend Engineer - Payments',
      description: 'Build the future of African payments at Flutterwave. As a Senior Backend Engineer, you will design high-throughput payment processing systems, ensure PCI-DSS compliance, and scale our infrastructure to handle millions of daily transactions.',
      requirements: '6+ years backend development experience. Expert in Java/Kotlin or Go. Experience with distributed systems and microservices. Knowledge of payment protocols and financial regulations.',
      skills: ['Java', 'Go', 'Microservices', 'Kafka', 'PostgreSQL', 'Payment Systems'],
      type: 'full-time' as const,
      location: 'Lagos, Nigeria (Remote options)',
      salary: 'NGN 2,500,000 - 4,000,000 per month',
      status: 'active' as const,
      featured: true,
    },
    {
      employerId: eid(2),
      title: 'DevOps Engineer',
      description: 'Flutterwave\'s infrastructure team is looking for a DevOps Engineer to automate deployments, manage cloud infrastructure across multiple regions, and ensure 99.99% uptime for our payment processing services.',
      requirements: '4+ years DevOps/SRE experience. Strong skills in Kubernetes, Terraform, and CI/CD pipelines. Experience with monitoring tools. AWS or GCP certification preferred.',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Prometheus'],
      type: 'full-time' as const,
      location: 'Lagos, Nigeria (Remote)',
      salary: 'NGN 1,800,000 - 3,000,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(3),
      title: 'Machine Learning Engineer',
      description: 'Andela\'s talent matching team needs an ML Engineer to build recommendation systems that match top African engineers with global opportunities. You will deploy models that assess skills, predict success, and reduce time-to-hire.',
      requirements: '4+ years ML engineering experience. Proficiency in Python, TensorFlow/PyTorch, and MLOps. Experience with NLP and recommendation systems. BS/MS in Computer Science or related field.',
      skills: ['Python', 'TensorFlow', 'MLOps', 'NLP', 'AWS SageMaker', 'SQL'],
      type: 'remote' as const,
      location: 'Nairobi, Kenya (Remote)',
      salary: 'KES 300,000 - 500,000 per month',
      status: 'active' as const,
      featured: true,
    },
    {
      employerId: eid(3),
      title: 'Technical Talent Sourcer',
      description: 'Help Andela identify and attract the best engineering talent across Africa. You will build pipelines of senior developers, conduct initial technical screenings, and create an exceptional candidate experience.',
      requirements: '3+ years in technical recruiting or talent sourcing. Understanding of software engineering roles and technologies. Excellent communication and relationship-building skills.',
      skills: ['Technical Recruiting', 'Sourcing', 'Screening', 'ATS', 'LinkedIn Recruiter'],
      type: 'full-time' as const,
      location: 'Nairobi, Kenya',
      salary: 'KES 200,000 - 300,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(4),
      title: 'Farm Operations Supervisor',
      description: 'Zambeef is hiring a Farm Operations Supervisor to oversee daily operations at our Mpongwe farming complex. You will manage a team of 50+ farm workers, optimize crop yields, maintain equipment, and ensure adherence to sustainable farming practices.',
      requirements: 'Diploma or degree in Agriculture or Agronomy. 5+ years in large-scale commercial farming. Leadership experience essential. Knowledge of irrigation systems and crop management.',
      skills: ['Farm Management', 'Crop Science', 'Irrigation', 'Leadership', 'Equipment Maintenance'],
      type: 'full-time' as const,
      location: 'Mpongwe, Zambia',
      salary: 'ZMW 18,000 - 28,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(5),
      title: 'Bioenergy Process Engineer',
      description: 'Sunbird Bioenergy seeks a Process Engineer to optimize our ethanol production facility. You will improve distillation processes, reduce waste, and ensure our bio-refinery operates at peak efficiency while meeting environmental standards.',
      requirements: 'Bachelor\'s degree in Chemical or Process Engineering. 4+ years in process engineering, preferably in biofuels or brewing. Strong analytical and problem-solving skills.',
      skills: ['Process Engineering', 'Distillation', 'Six Sigma', 'AutoCAD', 'Hazard Analysis'],
      type: 'full-time' as const,
      location: 'Makeni, Sierra Leone',
      salary: 'SLL 45,000,000 - 65,000,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(6),
      title: 'Urban Farming Trainer',
      description: 'GreenFingers Africa is looking for an Urban Farming Trainer to teach youth and women how to grow food in urban environments. You will develop curriculum, lead hands-on workshops, and build a community of urban farmers in Dakar.',
      requirements: 'Background in Agriculture, Horticulture, or Environmental Science. Teaching or training experience. Passion for community development. Fluent in French and Wolof.',
      skills: ['Urban Farming', 'Training', 'Community Outreach', 'Horticulture', 'French'],
      type: 'part-time' as const,
      location: 'Dakar, Senegal',
      salary: 'XOF 400,000 - 600,000 per month',
      status: 'active' as const,
      featured: false,
    },
    {
      employerId: eid(7),
      title: 'Career Coach & Mentor',
      description: 'EduBridge Zambia is hiring a Career Coach to guide Zambian professionals into remote work. You will assess candidate readiness, provide skills coaching, facilitate mock interviews, and track placement success.',
      requirements: '3+ years in career counseling, HR, or recruitment. Understanding of the global remote work market. Empathetic communicator with a track record of helping people achieve career goals.',
      skills: ['Career Coaching', 'Mentorship', 'Interview Preparation', 'Remote Work', 'HR'],
      type: 'contract' as const,
      location: 'Lusaka, Zambia (Hybrid)',
      salary: 'ZMW 12,000 - 18,000 per month',
      status: 'active' as const,
      featured: true,
    },
  ];

  const insertedJobs = await db.insert(jobs).values(jobsData);
  const firstJobId = Number(insertedJobs[0].insertId);
  console.log(`  Inserted ${jobsData.length} jobs (IDs ${firstJobId} - ${firstJobId + jobsData.length - 1})`);

  // Helper to get job ID by index
  const jid = (idx: number) => firstJobId + idx;

  // ── 6. Applications (20) ──
  console.log('  Seeding applications...');
  const applicationsData = [
    { jobId: jid(0), talentId: tid(0), userId: uid(0), status: 'shortlisted' as const, coverLetter: 'I am excited to apply for the Senior Full-Stack Developer role at BongoHive. With 8 years building fintech platforms across Africa, I believe I can significantly contribute to your incubator platform and mentor upcoming developers.', resumeUrl: 'https://storage.levav.africa/resumes/mutale-mwanza.pdf' },
    { jobId: jid(0), talentId: tid(7), userId: uid(7), status: 'reviewed' as const, coverLetter: 'As a co-founder of an AgriTech startup and experienced full-stack developer, I bring both technical depth and entrepreneurial mindset to this role. My experience with React, Node.js, and AWS aligns perfectly with your requirements.', resumeUrl: 'https://storage.levav.africa/resumes/chidi-okafor.pdf' },
    { jobId: jid(0), talentId: tid(5), userId: uid(5), status: 'pending' as const, coverLetter: 'I am a creative technologist with experience building web platforms for social impact. Though my background is in writing, I have taught myself full-stack development and built several production applications.', resumeUrl: 'https://storage.levav.africa/resumes/tendai-mutasa.pdf' },
    { jobId: jid(1), talentId: tid(1), userId: uid(1), status: 'pending' as const, coverLetter: 'As a visual artist with growing interest in digital design, I would love to bring my aesthetic sensibility to UI/UX design. I have completed a Google UX Design certificate and built a portfolio of case studies.', resumeUrl: 'https://storage.levav.africa/resumes/grace-lungu.pdf' },
    { jobId: jid(2), talentId: tid(10), userId: uid(10), status: 'shortlisted' as const, coverLetter: 'My background in agribusiness and farm management has given me deep insight into supply chain operations across East Africa. I am eager to apply my analytical skills to optimize MPharma\'s pharmaceutical distribution network.', resumeUrl: 'https://storage.levav.africa/resumes/nia-johnson.pdf' },
    { jobId: jid(2), talentId: tid(0), userId: uid(0), status: 'rejected' as const, coverLetter: 'I am looking to expand my skill set into supply chain analytics. While my background is primarily in software engineering, I have strong data analysis skills with SQL and Python.', resumeUrl: 'https://storage.levav.africa/resumes/mutale-mwanza-v2.pdf' },
    { jobId: jid(3), talentId: tid(8), userId: uid(8), status: 'hired' as const, coverLetter: 'With 10+ years in nursing and public health, I understand the pharmaceutical landscape intimately. My experience managing maternal health programs has prepared me to oversee pharmacy operations and ensure regulatory compliance.', resumeUrl: 'https://storage.levav.africa/resumes/fatima-said.pdf' },
    { jobId: jid(3), talentId: tid(11), userId: uid(11), status: 'shortlisted' as const, coverLetter: 'As a cardiologist with extensive clinical experience and a digital health innovator, I bring unique dual perspective to pharmacy operations. I understand both the medical and operational sides of healthcare delivery.', resumeUrl: 'https://storage.levav.africa/resumes/dr-omar-hassan.pdf' },
    { jobId: jid(4), talentId: tid(7), userId: uid(7), status: 'shortlisted' as const, coverLetter: 'Building payment-adjacent systems at my AgriTech startup has given me deep expertise in financial transaction processing. I am excited to bring this experience to Flutterwave and scale systems handling millions of daily transactions.', resumeUrl: 'https://storage.levav.africa/resumes/chidi-okafor-v2.pdf' },
    { jobId: jid(4), talentId: tid(0), userId: uid(0), status: 'reviewed' as const, coverLetter: 'My experience building fintech infrastructure in Zambia has prepared me for the challenges of scaling payment systems. I have deep expertise in distributed systems and database optimization.', resumeUrl: 'https://storage.levav.africa/resumes/mutale-mwanza-v3.pdf' },
    { jobId: jid(5), talentId: tid(0), userId: uid(0), status: 'pending' as const, coverLetter: 'I have managed AWS infrastructure for multiple production applications and implemented CI/CD pipelines that reduced deployment time by 80%. I am excited about the challenge of maintaining 99.99% uptime.', resumeUrl: 'https://storage.levav.africa/resumes/mutale-mwanza-v4.pdf' },
    { jobId: jid(6), talentId: tid(7), userId: uid(7), status: 'reviewed' as const, coverLetter: 'I have built and deployed ML models for crop disease detection and market price prediction. My expertise in TensorFlow, MLOps, and NLP makes me an ideal fit for building talent recommendation systems at Andela.', resumeUrl: 'https://storage.levav.africa/resumes/chidi-okafor-v3.pdf' },
    { jobId: jid(6), talentId: tid(0), userId: uid(0), status: 'pending' as const, coverLetter: 'While my primary expertise is in full-stack development, I have completed several ML courses and built recommendation systems as side projects. I am eager to transition into ML engineering full-time.', resumeUrl: 'https://storage.levav.africa/resumes/mutale-mwanza-v5.pdf' },
    { jobId: jid(7), talentId: tid(10), userId: uid(10), status: 'pending' as const, coverLetter: 'Running a 50-hectare farm has taught me the importance of identifying and developing talent. I would love to bring my people-skills and understanding of African professionals to the Technical Talent Sourcer role.', resumeUrl: 'https://storage.levav.africa/resumes/nia-johnson-v2.pdf' },
    { jobId: jid(8), talentId: tid(10), userId: uid(10), status: 'shortlisted' as const, coverLetter: 'Managing a 50-hectare farm in Rwanda\'s Eastern Province has given me hands-on experience in large-scale commercial agriculture. I am excited to bring my expertise in crop management and team leadership to Zambeef.', resumeUrl: 'https://storage.levav.africa/resumes/nia-johnson-v3.pdf' },
    { jobId: jid(9), talentId: tid(10), userId: uid(10), status: 'pending' as const, coverLetter: 'My degree in Agricultural Engineering and experience managing farm operations positions me well to understand and optimize bioenergy production processes. I am fascinated by the intersection of agriculture and renewable energy.', resumeUrl: 'https://storage.levav.africa/resumes/nia-johnson-v4.pdf' },
    { jobId: jid(10), talentId: tid(10), userId: uid(10), status: 'hired' as const, coverLetter: 'As a farm manager passionate about community development, I have trained dozens of youth in sustainable farming practices. I am excited to bring this experience to GreenFingers Africa and scale urban farming across Dakar.', resumeUrl: 'https://storage.levav.africa/resumes/nia-johnson-v5.pdf' },
    { jobId: jid(10), talentId: tid(5), userId: uid(5), status: 'reviewed' as const, coverLetter: 'Though my background is in writing, I have extensive experience as a community organizer and educator. I have designed and facilitated workshops on creative expression and believe these skills translate well to training urban farmers.', resumeUrl: 'https://storage.levav.africa/resumes/tendai-mutasa-v2.pdf' },
    { jobId: jid(11), talentId: tid(8), userId: uid(8), status: 'shortlisted' as const, coverLetter: 'My decade of experience in public health has been deeply rooted in community care and mentorship. I have guided countless nurses and community health workers, developing the coaching skills needed for this role.', resumeUrl: 'https://storage.levav.africa/resumes/fatima-said-v2.pdf' },
    { jobId: jid(11), talentId: tid(11), userId: uid(11), status: 'pending' as const, coverLetter: 'As a physician who built a telemedicine platform serving 200,000+ patients, I understand what it takes to transition African professionals into global digital roles. I would love to guide others on this journey.', resumeUrl: 'https://storage.levav.africa/resumes/dr-omar-hassan-v2.pdf' },
  ];

  const insertedApplications = await db.insert(applications).values(applicationsData);
  console.log(`  Inserted ${applicationsData.length} applications`);

  // ── 7. Messages (20 messages in 5 conversations) ──
  console.log('  Seeding messages...');
  const messagesData = [
    // Conversation 1: Mutale (talent idx 0) <-> BongoHive HR (client idx 12)
    { senderId: uid(12), receiverId: uid(0), content: 'Hi Mutale, thank you for applying to the Senior Full-Stack Developer position at BongoHive. We were impressed by your portfolio and would love to schedule an initial interview. Are you available this Thursday at 2 PM CAT?', read: true },
    { senderId: uid(0), receiverId: uid(12), content: 'Hello John, thank you for reaching out! I am thrilled about the opportunity. Thursday at 2 PM CAT works perfectly for me. Should I prepare anything specific for the interview?', read: true },
    { senderId: uid(12), receiverId: uid(0), content: 'Great! Please come prepared to discuss a challenging technical project you\'ve worked on, particularly anything related to fintech or startup ecosystems. Also bring your laptop as there will be a brief coding exercise. Looking forward to meeting you!', read: true },
    { senderId: uid(0), receiverId: uid(12), content: 'Perfect, I will prepare a case study on the mobile payment platform I built for a Zambian fintech startup. I will bring my laptop as well. See you on Thursday!', read: false },

    // Conversation 2: Amara (talent idx 2) <-> MPharma CEO (client idx 13)
    { senderId: uid(13), receiverId: uid(2), content: 'Dear Amara, we came across your profile on Levav and were captivated by your unique blend of traditional Igbo melodies with contemporary Afrobeat. We are organizing a corporate wellness event for our staff across West Africa and would love to discuss a performance opportunity.', read: true },
    { senderId: uid(2), receiverId: uid(13), content: 'Dear Gregory, thank you so much for the kind words! I would be honoured to perform at your corporate wellness event. Could you share more details about the event date, location, and the kind of performance you are envisioning?', read: true },
    { senderId: uid(13), receiverId: uid(2), content: 'The event is scheduled for December 15th in Accra, Ghana. We are expecting about 500 staff members. We would love a 45-minute set that blends uplifting Afrobeat with some interactive elements to get the team energized. Is that something you can accommodate?', read: true },
    { senderId: uid(2), receiverId: uid(13), content: 'That sounds wonderful! A 45-minute high-energy set with audience interaction is exactly what I do best. I can bring my band and create a custom setlist for MPharma. Shall we discuss logistics and my rider requirements?', read: false },

    // Conversation 3: Nia (talent idx 10) <-> GreenFingers (employer idx 6 - user idx 6)
    { senderId: uid(6), receiverId: uid(10), content: 'Hello Nia, congratulations on being selected for the Urban Farming Trainer position! Your passion for sustainable agriculture and community development really shone through in your application. When can you start?', read: true },
    { senderId: uid(10), receiverId: uid(6), content: 'Dear Aissatou, I am absolutely thrilled to accept this opportunity! I can start on the 1st of next month. I would love to visit the Dakar rooftop farms before then to understand the current setup. Would that be possible?', read: true },
    { senderId: uid(6), receiverId: uid(10), content: 'That\'s fantastic! We would be delighted to have you visit. I will arrange a tour of our three main rooftop farm sites next week. Please share your travel dates and we will cover your accommodation in Dakar. Welcome to the team!', read: true },
    { senderId: uid(10), receiverId: uid(6), content: 'Thank you so much for the warm welcome! I will be available from the 20th onwards. I am already brainstorming curriculum ideas that combine Rwandan farming techniques with Senegal\'s unique urban context. Excited to get started!', read: false },

    // Conversation 4: Dr. Omar (talent idx 11) <-> Flutterwave (employer idx 2 - user idx 0)
    { senderId: uid(0), receiverId: uid(11), content: 'Dr. Hassan, thank you for your interest in our DevOps Engineer role. While your background in digital health is impressive, we are looking for someone with more infrastructure-focused experience. Have you considered our Technical Product Manager opening instead?', read: true },
    { senderId: uid(11), receiverId: uid(0), content: 'Thank you for the feedback. You are right that my background is more product-oriented. However, I have managed cloud infrastructure for my telemedicine platform serving 200,000+ patients. I would love to discuss how this experience translates to your DevOps needs.', read: true },
    { senderId: uid(0), receiverId: uid(11), content: 'That is a fair point. Managing infrastructure at that scale is no small feat. Let us schedule a technical conversation with our Engineering Lead to explore the fit. Would Tuesday at 11 AM WAT work for you?', read: true },
    { senderId: uid(11), receiverId: uid(0), content: 'Tuesday at 11 AM WAT works perfectly. I will prepare a brief presentation on my infrastructure architecture and the scaling challenges we overcame. Thank you for this opportunity!', read: false },

    // Conversation 5: Grace (talent idx 1) <-> Mutale (talent idx 0) - peer to peer
    { senderId: uid(1), receiverId: uid(0), content: 'Hey Mutale! I saw you were featured on the Levav homepage. Congratulations! I was wondering if you could help me with something - I want to build a digital portfolio website for my art but I am not very technical. Could you point me in the right direction?', read: true },
    { senderId: uid(0), receiverId: uid(1), content: 'Hi Grace! Thank you, and congratulations to you too - your mural work has been incredible! I would be happy to help. For an artist portfolio, I would recommend starting with a simple no-code tool like Framer or Webflow. They are very visual and designer-friendly.', read: true },
    { senderId: uid(1), receiverId: uid(0), content: 'That is really helpful! I have heard of Webflow but never tried it. Do you think it is worth learning properly or should I just hire someone to build it for me? I want something that really showcases my work beautifully.', read: true },
    { senderId: uid(0), receiverId: uid(1), content: 'Given how visual your work is, I think learning Webflow basics would be worth it - it gives you full control over the design without coding. But if you want something truly custom, I could recommend some great designers on Levav. Happy to intro you!', read: false },
  ];

  const insertedMessages = await db.insert(messages).values(messagesData);
  console.log(`  Inserted ${messagesData.length} messages`);

  // ── 8. Reviews (15) ──
  console.log('  Seeding reviews...');
  const reviewsData = [
    // Reviews of talents by clients/employers
    { reviewerId: uid(12), revieweeId: uid(2), rating: 5, comment: 'Amara performed at our annual tech conference and absolutely electrified the room. Her vocals are mesmerizing and her stage presence is unmatched. She was professional, punctual, and adapted her set perfectly to our diverse international audience. Already booking her for next year!' },
    { reviewerId: uid(13), revieweeId: uid(2), rating: 5, comment: 'We hired Amara for our corporate wellness event and she exceeded all expectations. Her ability to blend traditional Igbo sounds with modern Afrobeat created an unforgettable experience. Our staff from across West Africa are still talking about it.' },
    { reviewerId: uid(12), revieweeId: uid(0), rating: 5, comment: 'Mutale is one of the most talented developers I have worked with. He rebuilt our incubator platform from scratch, delivering ahead of schedule. His mentorship of junior developers has elevated our entire engineering culture. A true asset to any tech team.' },
    { reviewerId: uid(13), revieweeId: uid(8), rating: 5, comment: 'Fatima brought incredible expertise and compassion to our pharmacy operations. Her background in public health gave her unique insights that improved our patient outreach programs. She is a natural leader who inspires her team daily.' },
    { reviewerId: uid(0), revieweeId: uid(7), rating: 4, comment: 'Chidi delivered solid work on our payment integration project. His technical skills are strong and he brings creative solutions to complex problems. Communication could be more proactive at times, but the quality of his code is excellent.' },
    { reviewerId: uid(3), revieweeId: uid(4), rating: 5, comment: 'Zara\'s choreography for our product launch event was breathtaking. She fused contemporary and traditional African dance in a way that told our brand story perfectly. Highly recommend her for any corporate or creative project.' },
    { reviewerId: uid(4), revieweeId: uid(6), rating: 5, comment: 'Amina created bespoke outfits for our entire executive team and the craftsmanship was impeccable. Each piece was unique, beautifully tailored, and arrived on time. She has an incredible eye for combining traditional African textiles with modern silhouettes.' },
    { reviewerId: uid(6), revieweeId: uid(10), rating: 5, comment: 'Nia has transformed our urban farming program since she joined. Her curriculum is engaging, her farming knowledge is deep, and her passion is contagious. Our trainees consistently rate her workshops as life-changing. A remarkable educator and agriculturalist.' },
    { reviewerId: uid(7), revieweeId: uid(11), rating: 4, comment: 'Dr. Hassan consulted on our health-tech product strategy and provided invaluable insights. His dual expertise in clinical practice and digital health helped us navigate complex regulatory requirements. Would definitely engage him again.' },
    { reviewerId: uid(3), revieweeId: uid(3), rating: 4, comment: 'Kofi led a drumming workshop for our team building retreat and it was a phenomenal experience. His knowledge of Ghanaian rhythms and his patient teaching style made it accessible for everyone. The energy he brought was exactly what we needed.' },
    { reviewerId: uid(5), revieweeId: uid(5), rating: 5, comment: 'Tendai\'s spoken word performance at our literary festival moved the audience to tears. His words have a power that transcends the page. He was professional, gracious with fans, and delivered a performance that will be remembered for years.' },
    { reviewerId: uid(1), revieweeId: uid(1), rating: 5, comment: 'Grace painted a stunning mural for our office that has become the centerpiece of our workspace. Her artistic vision combined with her professionalism made the entire process seamless. She understood our brand and translated it into art beautifully.' },
    { reviewerId: uid(9), revieweeId: uid(9), rating: 5, comment: 'Pastor James led worship at our conference and the anointing was palpable. His voice, his humility, and his ability to lead people into genuine worship created an atmosphere we will never forget. We have already invited him back for next year.' },
    { reviewerId: uid(12), revieweeId: uid(0), rating: 3, comment: 'Mutale is technically brilliant but we had some challenges with timeline communication on our second project together. The work quality remained high, but project management could improve. Still a valuable partner for complex technical work.' },
    { reviewerId: uid(8), revieweeId: uid(10), rating: 5, comment: 'Working with Nia on the farm management consultation was eye-opening. Her sustainable agriculture techniques have reduced our water usage by 40% while increasing yields. She is a visionary in African agriculture.' },
  ];

  const insertedReviews = await db.insert(reviews).values(reviewsData);
  console.log(`  Inserted ${reviewsData.length} reviews`);

  // ── 9. WRI Scores (12 - one per talent) ──
  console.log('  Seeding WRI scores...');
  const wriScoresData = [
    { talentId: tid(0), overall: 92, technical: 95, communication: 88, reliability: 94, leadership: 90, creativity: 85, growth: 93 },
    { talentId: tid(1), overall: 88, technical: 82, communication: 90, reliability: 92, leadership: 85, creativity: 96, growth: 87 },
    { talentId: tid(2), overall: 95, technical: 90, communication: 93, reliability: 96, leadership: 88, creativity: 98, growth: 91 },
    { talentId: tid(3), overall: 86, technical: 84, communication: 88, reliability: 90, leadership: 82, creativity: 89, growth: 85 },
    { talentId: tid(4), overall: 91, technical: 85, communication: 92, reliability: 93, leadership: 90, creativity: 95, growth: 88 },
    { talentId: tid(5), overall: 89, technical: 80, communication: 94, reliability: 91, leadership: 86, creativity: 97, growth: 87 },
    { talentId: tid(6), overall: 87, technical: 88, communication: 85, reliability: 92, leadership: 83, creativity: 94, growth: 86 },
    { talentId: tid(7), overall: 93, technical: 96, communication: 87, reliability: 91, leadership: 89, creativity: 90, growth: 95 },
    { talentId: tid(8), overall: 90, technical: 88, communication: 92, reliability: 95, leadership: 91, creativity: 84, growth: 89 },
    { talentId: tid(9), overall: 85, technical: 82, communication: 90, reliability: 88, leadership: 87, creativity: 86, growth: 84 },
    { talentId: tid(10), overall: 94, technical: 90, communication: 93, reliability: 95, leadership: 92, creativity: 91, growth: 96 },
    { talentId: tid(11), overall: 96, technical: 94, communication: 91, reliability: 93, leadership: 95, creativity: 89, growth: 92 },
  ];

  const insertedWriScores = await db.insert(wriScores).values(wriScoresData);
  console.log(`  Inserted ${wriScoresData.length} WRI scores`);

  // ── 10. Notifications (10) ──
  console.log('  Seeding notifications...');
  const notificationsData = [
    { userId: uid(0), type: 'application_update', title: 'Application Shortlisted', message: 'Your application for Senior Full-Stack Developer at BongoHive has been shortlisted. The hiring manager will contact you soon.', read: true, link: '/dashboard/applications' },
    { userId: uid(0), type: 'message', title: 'New Message from BongoHive', message: 'John Banda sent you a message regarding your interview scheduling.', read: true, link: '/dashboard/messages' },
    { userId: uid(0), type: 'review', title: 'New Review Received', message: 'BongoHive left you a 5-star review: "Mutale is one of the most talented developers I have worked with..."', read: false, link: '/dashboard/reviews' },
    { userId: uid(7), type: 'application_update', title: 'Application Under Review', message: 'Your application for Senior Backend Engineer at Flutterwave is being reviewed by the hiring team.', read: true, link: '/dashboard/applications' },
    { userId: uid(7), type: 'application_update', title: 'Application Shortlisted', message: 'Congratulations! You have been shortlisted for the Senior Backend Engineer role at Flutterwave.', read: false, link: '/dashboard/applications' },
    { userId: uid(8), type: 'job_offer', title: 'Job Offer from MPharma', message: 'You have received a job offer for Pharmacy Operations Manager at MPharma. Please review and respond by November 30th.', read: true, link: '/dashboard/offers' },
    { userId: uid(10), type: 'application_update', title: 'Application Accepted', message: 'Your application for Urban Farming Trainer at GreenFingers Africa has been accepted! Welcome to the team.', read: true, link: '/dashboard/applications' },
    { userId: uid(10), type: 'review', title: 'New Review from GreenFingers Africa', message: 'GreenFingers Africa left you a 5-star review: "Nia has transformed our urban farming program since she joined..."', read: false, link: '/dashboard/reviews' },
    { userId: uid(2), type: 'message', title: 'New Message from MPharma', message: 'Gregory Rockson sent you a message about a performance opportunity at their corporate wellness event.', read: true, link: '/dashboard/messages' },
    { userId: uid(12), type: 'system', title: 'Profile Verification Complete', message: 'Your employer profile for BongoHive has been verified. You can now post jobs and message talents.', read: false, link: '/dashboard/settings' },
  ];

  const insertedNotifications = await db.insert(notifications).values(notificationsData);
  console.log(`  Inserted ${notificationsData.length} notifications`);

  // ── Summary ──
  console.log('\n✅ Seed complete!');
  console.log('');
  console.log('📊 Seeded Data Summary:');
  console.log(`   • Users:           ${usersData.length}`);
  console.log(`   • Talents:         ${talentsData.length}`);
  console.log(`   • Categories:      ${categoriesData.length}`);
  console.log(`   • Employers:       ${employersData.length}`);
  console.log(`   • Jobs:            ${jobsData.length}`);
  console.log(`   • Applications:    ${applicationsData.length}`);
  console.log(`   • Messages:        ${messagesData.length}`);
  console.log(`   • Reviews:         ${reviewsData.length}`);
  console.log(`   • WRI Scores:      ${wriScoresData.length}`);
  console.log(`   • Notifications:   ${notificationsData.length}`);
  console.log('');
  console.log('🚀 The database is now populated with realistic African data!');
  console.log('   Run the app to explore all the seeded content.');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
