import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';
import SectionHeader from '@/components/SectionHeader';

const offices = [
  { city: 'Lagos, Nigeria', address: 'Victoria Island, Lagos' },
  { city: 'Nairobi, Kenya', address: 'Westlands, Nairobi' },
  { city: 'Cape Town, SA', address: 'Foreshore, Cape Town' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast.success('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          label="Contact"
          title="Let&apos;s Connect"
          subtitle="Have a question, partnership idea, or just want to say hello? We'd love to hear from you."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#C6FF34]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Email</h3>
                    <p className="text-sm text-[#A0A0A0]">hello@levav.africa</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-[#C6FF34]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Phone</h3>
                    <p className="text-sm text-[#A0A0A0]">+234 800 123 4567</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hover={false}>
              <h3 className="text-sm font-semibold text-white mb-4">Our Offices</h3>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div key={office.city} className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#C6FF34] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{office.city}</p>
                      <p className="text-xs text-[#666666]">{office.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="p-6 sm:p-8" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-lime w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
