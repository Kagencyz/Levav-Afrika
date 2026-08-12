import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function AuditSection() {
  return (
    <div className="space-y-6">
      <motion.h2
        className="text-2xl font-semibold text-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Audit Logs
      </motion.h2>

      <motion.section
        className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6 sm:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        aria-labelledby="audit-unavailable-title"
      >
        <ShieldAlert className="mb-5 h-8 w-8 text-amber-300" aria-hidden="true" />
        {/* TODO(WP-0004): resolve these through admin.audit.unavailable.* copy keys. */}
        <h3 id="audit-unavailable-title" className="text-xl font-semibold text-white">
          Levav is not recording an audit trail yet
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
          Audit logging is not in place. No record is being kept of sign-ins, privileged actions or protected-data access, and none exists for any earlier period. Treat the absence of records here as &quot;not measured&quot;, never as &quot;nothing happened&quot;.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/50">
          Server-side audit logging is specified in the Master PRD (SEC-005) and is scheduled for production hardening.
        </p>
      </motion.section>
    </div>
  );
}
