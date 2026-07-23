import { HashRouter, Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { TRPCProvider } from '@/providers/trpc';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import TalentDirectory from '@/pages/TalentDirectory';
import TalentProfile from '@/pages/TalentProfile';
import Employers from '@/pages/Employers';
import Opportunities from '@/pages/Opportunities';
import JobDetail from '@/pages/JobDetail';
import Impact from '@/pages/Impact';
import Learn from '@/pages/Learn';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/Onboarding';
import ProfileCreate from '@/pages/ProfileCreate';
import JobApply from '@/pages/JobApply';
import Messages from '@/pages/Messages';
import EmployerJobs from '@/pages/EmployerJobs';
import ShaderDemo from '@/pages/ShaderDemo';
import Admin from '@/pages/Admin';
import EmployerAnalytics from '@/pages/EmployerAnalytics';
import TalentAnalytics from '@/pages/TalentAnalytics';
import Settings from '@/pages/Settings';
import Booking from '@/pages/Booking';
import MilestonePayments from '@/pages/MilestonePayments';
import ContractWorkspace from '@/pages/ContractWorkspace';
import Projects from '@/pages/Projects';
import SkillGap from '@/pages/SkillGap';
import SmartMatch from '@/pages/SmartMatch';
import MarketIntel from '@/pages/MarketIntel';
import Screening from '@/pages/Screening';
import QuickWork from '@/pages/QuickWork';
import Levav28 from '@/pages/Levav28';
import ContentStudio from '@/pages/ContentStudio';
import ChampionApply from '@/pages/ChampionApply';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/talent" element={<TalentDirectory />} />
            <Route path="/talent/:id" element={<TalentProfile />} />
            <Route path="/booking/:talentId" element={<Booking />} />
            <Route path="/employers" element={<Employers />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile/create" element={<ProfileCreate />} />
            <Route path="/apply/:jobId" element={<JobApply />} />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/analytics"
              element={
                <ProtectedRoute>
                  <EmployerAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/talent/analytics"
              element={
                <ProtectedRoute>
                  <TalentAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs"
              element={
                <ProtectedRoute>
                  <EmployerJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments/:bookingId"
              element={
                <ProtectedRoute>
                  <MilestonePayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/smart-match"
              element={
                <ProtectedRoute>
                  <SmartMatch />
                </ProtectedRoute>
              }
            />
            <Route path="/contract/:bookingId" element={<ContractWorkspace />} />
            <Route path="/quickwork" element={<QuickWork />} />
            <Route path="/levav28" element={
              <ProtectedRoute>
                <Levav28 />
              </ProtectedRoute>
            } />
            <Route path="/content-studio" element={
              <ProtectedRoute>
                <ContentStudio />
              </ProtectedRoute>
            } />
            <Route path="/champion-apply" element={<ChampionApply />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/market-intel" element={<MarketIntel />} />
            <Route
              path="/screening"
              element={
                <ProtectedRoute>
                  <Screening />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Standalone pages without Layout (Navbar/Footer) */}
          <Route path="/shader-demo" element={<ShaderDemo />} />
          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <TRPCProvider>
      <HashRouter>
        <AnimatedRoutes />
      </HashRouter>
    </TRPCProvider>
  );
}
