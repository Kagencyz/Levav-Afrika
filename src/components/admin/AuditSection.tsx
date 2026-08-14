import { ShieldAlert } from "lucide-react";

// TODO(WP-0004): Move admin.audit.unavailable.title,
// admin.audit.unavailable.body, and admin.audit.unavailable.planned into the copy module.
export default function AuditSection() {
  return (
    <section className="max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8" aria-labelledby="audit-unavailable-title">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10">
        <ShieldAlert className="h-6 w-6 text-amber-300" aria-hidden="true" />
      </div>
      <h2 id="audit-unavailable-title" className="text-2xl font-semibold text-white">
        Levav is not recording an audit trail yet
      </h2>
      <p className="mt-4 leading-7 text-[#C7C7C7]">
        Audit logging is not in place. No record is being kept of sign-ins, privileged actions or protected-data access, and none exists for any earlier period. Treat the absence of records here as &quot;not measured&quot;, never as &quot;nothing happened&quot;.
      </p>
      <p className="mt-4 text-sm leading-6 text-[#A0A0A0]">
        Server-side audit logging is specified in the Master PRD (SEC-005) and is scheduled for production hardening.
      </p>
    </section>
  );
}
