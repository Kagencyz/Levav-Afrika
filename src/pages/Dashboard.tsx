import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Circle,
  LayoutDashboard,
  Loader2,
  MapPin,
  Settings,
  Target,
  UserRound,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/profile/create', icon: UserRound },
  { label: 'Opportunities', path: '/opportunities', icon: BriefcaseBusiness },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const goalLabels: Record<string, string> = {
  develop: 'Develop my career',
  'find-job': 'Find a job',
  'find-quickwork': 'Find QuickWork',
  hire: 'Hire talent',
  'post-quickwork': 'Post QuickWork',
  'find-volunteer': 'Find volunteer work',
  'post-volunteer': 'Post volunteer work',
  learn: 'Learn new skills',
  community: 'Join the community',
};

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="border-b border-white/[0.06] bg-[#080808] md:fixed md:inset-y-[72px] md:left-0 md:w-56 md:border-b-0 md:border-r">
      <nav aria-label="Dashboard navigation" className="flex gap-1 overflow-x-auto p-3 md:flex-col md:p-4">
        {navigation.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-[#C6FF34]/20 bg-[#C6FF34]/10 text-[#C6FF34]'
                  : 'border-transparent text-[#888] hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="grid h-14 w-14 place-items-center rounded-full"
      style={{ background: `conic-gradient(#C6FF34 ${value}%, rgba(255,255,255,.08) 0)` }}
      aria-label={`${value}% complete`}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-[#101010] text-sm font-semibold text-white">
        {value}%
      </div>
    </div>
  );
}

function EmptyState({ title, description, href, action }: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <Circle className="mx-auto mb-3 h-7 w-7 text-white/20" aria-hidden="true" />
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#777]">{description}</p>
      <Link to={href} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#C6FF34] hover:underline">
        {action}<ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const summary = trpc.dashboard.summary.useQuery(undefined, { retry: 1 });
  const data = summary.data;
  const firstName = data?.account?.name.split(' ')[0] || user?.firstName || 'there';

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <main className="p-4 sm:p-6 md:ml-56 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#C6FF34]">Your workspace</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome, {firstName}</h1>
            <p className="mt-1 text-sm text-[#777]">Real progress from your Levav account.</p>
          </div>

          {summary.isPending ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Loader2 className="h-7 w-7 animate-spin text-[#C6FF34]" aria-label="Loading dashboard" />
            </div>
          ) : summary.isError || !data?.account ? (
            <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
              <h2 className="font-medium">We couldn’t load your dashboard</h2>
              <p className="mt-1 text-sm text-[#999]">Refresh the page. If this continues, your session may need to be renewed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <section aria-label="Account summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Profile', value: `${data.profileCompletion}%`, detail: data.talentProfile ? 'Database profile' : 'Not created', icon: UserRound },
                  { label: 'Onboarding', value: data.onboarding ? 'Complete' : 'Pending', detail: data.onboarding ? (data.onboarding.primaryGoal ? goalLabels[data.onboarding.primaryGoal] ?? data.onboarding.primaryGoal : 'Choose your goals') : 'Choose your goals', icon: CheckCircle2 },
                  { label: 'Organizations', value: String(data.organizations.length), detail: data.organizations.length ? 'Active memberships' : 'No memberships', icon: Building2 },
                  { label: 'Applications', value: String(data.applications.total), detail: data.applications.available ? 'Tracked applications' : 'Jobs system coming next', icon: BriefcaseBusiness },
                ].map((stat, index) => (
                  <motion.article
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                  >
                    <stat.icon className="mb-5 h-5 w-5 text-[#C6FF34]" aria-hidden="true" />
                    <p className="text-xs uppercase tracking-wider text-[#666]">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 truncate text-xs text-[#777]">{stat.detail}</p>
                  </motion.article>
                ))}
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">Talent profile</h2>
                      <p className="mt-1 text-xs text-[#777]">Your public professional identity.</p>
                    </div>
                    <ProgressRing value={data.profileCompletion} />
                  </div>
                  {data.talentProfile ? (
                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-lg font-medium">{data.talentProfile.name}</p>
                        <p className="text-sm text-[#999]">{data.talentProfile.category || 'Category not set'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#777]">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {data.talentProfile.location || 'Location not set'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.talentProfile.skills.length ? data.talentProfile.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#bbb]">{skill}</span>
                        )) : <span className="text-xs text-[#666]">No skills added yet</span>}
                      </div>
                      <Link to="/profile/create" className="inline-flex items-center gap-1 text-sm font-medium text-[#C6FF34] hover:underline">
                        Edit profile<ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <EmptyState title="Create your talent profile" description="Add your skills, location, category, and professional story so employers can discover you." href="/profile/create" action="Build profile" />
                    </div>
                  )}
                </article>

                <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C6FF34]" aria-hidden="true" />
                    <h2 className="font-semibold">Next steps</h2>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { done: Boolean(data.onboarding), label: 'Set your goals and current status', href: '/welcome' },
                      { done: Boolean(data.talentProfile), label: 'Create your talent profile', href: '/profile/create' },
                      { done: data.profileCompletion === 100, label: 'Complete every profile field', href: '/profile/create' },
                    ].map((step) => (
                      <Link key={step.label} to={step.href} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3 hover:border-[#C6FF34]/20">
                        {step.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C6FF34]" /> : <Circle className="h-5 w-5 shrink-0 text-[#555]" />}
                        <span className={`text-sm ${step.done ? 'text-[#888] line-through' : 'text-white'}`}>{step.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/[0.06] pt-5">
                    <p className="text-xs text-[#666]">Signed in as</p>
                    <p className="mt-1 text-sm text-[#aaa]">{data.account.email}</p>
                  </div>
                </article>
              </section>

              <section>
                <EmptyState
                  title="No application activity yet"
                  description="The production jobs and applications workflow is the next domain being built. Until then, this dashboard will show zero rather than demo records."
                  href="/opportunities"
                  action="Explore current opportunities"
                />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
