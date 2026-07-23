import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';

const ecosystemLinks = [
  { label: 'Levav 28\u2122', href: '/onboarding' },
  { label: 'QuickWork\u2122', href: '/opportunities' },
  { label: 'Levav ID\u2122', href: '/talent' },
  { label: 'WRI\u2122', href: '/dashboard' },
  { label: 'Levav Impact\u2122', href: '/impact' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Employers', href: '/employers' },
  { label: 'Champions', href: '/champions' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmail('');
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/[0.06] pb-16 md:pb-0" style={{ backgroundColor: '#111111' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-[#C6FF34] font-display">Levav&trade;</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#A0A0A0] max-w-xs font-body">
              Africa&apos;s Workforce Intelligence Ecosystem. Transforming potential
              into capability, capability into contribution, and contribution into
              opportunity.
            </p>
          </motion.div>

          {/* Ecosystem Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-display">
              Ecosystem
            </h4>
            <ul className="space-y-3">
              {ecosystemLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#A0A0A0] hover:text-[#C6FF34] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-display">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-sm text-[#A0A0A0] hover:text-[#C6FF34] transition-colors duration-200 font-body"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-[#A0A0A0] hover:text-[#C6FF34] transition-colors duration-200 font-body"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-display">
              Newsletter
            </h4>
            <p className="text-sm text-[#A0A0A0] mb-4 font-body">
              Stay updated with the latest opportunities and insights.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors font-body"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2.5 bg-[#C6FF34] text-black rounded-lg hover:bg-[#d4ff5c] transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#666666] font-body">
            &copy; {new Date().getFullYear()} Levav&trade; Talent Afrika. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/"
              onClick={(e) => e.preventDefault()}
              className="text-[#A0A0A0] hover:text-[#C6FF34] transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="/"
              onClick={(e) => e.preventDefault()}
              className="text-[#A0A0A0] hover:text-[#C6FF34] transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="/"
              onClick={(e) => e.preventDefault()}
              className="text-[#A0A0A0] hover:text-[#C6FF34] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
