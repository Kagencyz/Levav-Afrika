# WP-0004 implementation report

**Status:** READY_FOR_REVIEW — D-0004-1 fixed

## Built and verified

- Added a generated, typed `en-ZM` copy catalogue with 431 approved keys, typed lookup,
  interpolation, copy tests, and a scoped prohibited-language drift guard.
- Migrated the six Amendment A1 files. Routing slugs and destinations are unchanged;
  `onboardingRouting.test.ts` is unmodified. `src/pages/Onboarding.tsx` is unmodified.
- Targeted tests pass (13/13). Full suite passes (61/61). Full typecheck passes with the shrink-only frontend baseline
  unchanged at 136.
- All 13 Amendment A1 acceptance criteria are satisfied; no Product decision remains open.
- Production bundle before: 2,494.97 kB / 633.14 kB gzip. After: 2,523.10 kB /
  641.66 kB gzip. The governed 431-key catalogue adds 28.13 kB raw and 8.52 kB gzip
  (1.35% gzip), with no i18n dependency.

## D-0004-1

Fixed using the approved §17.11 keys. Both sentence forms now resolve through
`auth.throttle.message`; the disabled-button countdown resolves through `auth.throttle.action`.
Throttle timing, counters and lockout logic are unchanged.

The four over-length validation messages were removed as unreachable UI branches: each field's
`maxLength` prevents the form state from exceeding the same constant. No governed replacement
copy was invented.

## Wording changes (Criterion 13)

| Old text | Key | New text |
|---|---|---|
| Page Not Found | `notfound.title` | This page does not exist |
| The page you are looking for does not exist or has been moved. | `notfound.body` | The link may be out of date, or the page may have moved. |
| `{pathname}` | `notfound.path` | You asked for: `{path}` |
| Go Back | `notfound.action.back` | Go back |
| Back to Home | `notfound.action.home` | Go to your home page |
| You are offline. Your actions will be saved and synced when you reconnect. | `global.offline.banner` | You are offline. Levav will save what you do and sync it when you reconnect. |
| Email confirmed. Sign in to continue. | `auth.verify.confirmed` | Your email is confirmed. Sign in to continue. |
| That confirmation link has expired. Request a fresh email below. | `auth.verify.expired` | That confirmation link has expired. Request a new one below. |
| First name is required | `auth.validation.firstname.required` | Enter your first name. |
| Last name is required | `auth.validation.lastname.required` | Enter your last name. |
| Email is required | `auth.validation.email.required` | Enter your email address. |
| Please enter a valid email address | `auth.validation.email.invalid` | That does not look like an email address. |
| Password is required | `auth.validation.password.required` | Enter a password. |
| Password must be at least 6 characters | `auth.validation.password.tooshort` | Use at least 6 characters. |
| Please confirm your password | `auth.validation.confirmpassword.required` | Enter your password again. |
| Passwords do not match | `auth.validation.password.mismatch` | These two passwords do not match. |
| Confirmation email sent. / Account created! | `auth.success.registered` | Your Levav ID is created. Confirm your email to continue. |
| Welcome back! | `auth.success.signedin` | Signed in. |
| This email is already registered — try signing in. | `auth.error.duplicate` | That email address already has an account. Sign in instead. |
| Invalid email or password. | `auth.error.credentials` | That email address and password do not match an account. |
| Confirmation email limit reached. Please wait an hour and try again. | `auth.error.ratelimited` | Too many confirmation emails have been sent to this address. Wait an hour and try again. |
| Something went wrong. Please try again. | `auth.error.generic` | Something went wrong on our side. Try again in a moment. |
| Welcome Back | `auth.talent.signin.title` | Welcome back |
| Sign in to your account to continue | `auth.talent.signin.subtitle` | Sign in to continue. |
| Create Employer Account | `auth.employer.signup.title` | Create an employer account |
| Confirm your work email, then register your organization | `auth.employer.signup.subtitle` | Confirm your work email, then register your organisation. |
| Join Levav™ | `auth.talent.signup.title` | Join Levav |
| Create your account and start your journey | `auth.talent.signup.subtitle` | Create your Levav ID and start building evidence of what you can do. |
| Confirmation body plus a second instruction sentence | `auth.verify.sentto` | We sent a confirmation link to `{email}`. |
| A fresh confirmation email was sent. | `auth.verify.resend.sent` | A new confirmation email is on its way. |
| Please wait before requesting another email. | `auth.verify.resend.toosoon` | Wait a moment before requesting another email. |
| Could not resend the email. Please try again. | `auth.verify.resend.failed` | That email could not be sent. Check your connection and try again. |
| Sending… | `auth.verify.resend.sending` | Sending |
| First Name / Last Name / Email / Confirm Password | `auth.field.*` | First name / Last name / Email address / Confirm password |
| Confirm your password | `auth.placeholder.confirmpassword` | Enter your password again |
| One free account for everything… | `auth.signup.subtitle` | One identity for your work, your evidence and every organisation you join. |
| Sign In / Create Account / Sign Up | `auth.login.action`, `auth.signup.action`, `auth.switch.*` | Sign in / Create Levav ID / Create an account |
| Welcome, `{name}`! / Welcome to Levav™! | `welcome.title` | Welcome to Levav |
| What do you want…first choice shapes where we take you. | `onboarding.intentions.help` | Choose everything that applies. Most people do more than one. |
| And where are you right now?… | `onboarding.situation.help` | This is private. It shapes what Levav shows you and is never shown to employers. |
| Your current status | `welcome.status.heading` | Where you are now |
| You’re all set! | `welcome.done` | Your Levav ID is ready. |
| Setting up... | `welcome.saving` | Setting up your account |
| Too many attempts. Please wait `{seconds}` seconds. / Too many attempts. Please wait `{seconds}` seconds before retrying. | `auth.throttle.message` | Too many sign-in attempts. For your security, wait `{seconds}` seconds before trying again. |
| Wait `{seconds}`s | `auth.throttle.action` | Wait `{seconds}`s |
| Develop myself professionally | `intent.develop` | Build and prove my readiness |
| Find a full-time or part-time job | `intent.find_work` | Find a job |
| Find QuickWork™ or freelance gigs | `intent.find_quickwork` | Find QuickWork assignments |
| Hire talent for an organisation | `intent.hire` | Hire people for an organisation |
| Post a quick job or gig | `intent.post_quickwork` | Post QuickWork assignments |
| Find volunteer opportunities | `intent.contribute` | Contribute my skills through Impact |
| Post volunteer opportunities | `intent.post_contribution` | Publish contribution opportunities |
| Learn through courses and programmes | `intent.learn` | Learn and close skill gaps |
| Build my professional network | `intent.network` | Connect with other professionals |
| Unemployed | `situation.not_working` | Not currently working |
| Volunteering | `situation.legacy.volunteering` | Contributing my time |
| Changing careers | `situation.legacy.changing_careers` | Changing direction |
| Returning to work | `situation.career_break` | On a career break |
| Running an organisation or business | `situation.running_organisation` | Running an organisation |

All nine former goal descriptions are retired, as A1.4 requires: `Grow through a Levav 28™
pathway built for you`; `Verified roles matched to your profile`; `Stay active and earning with
project work`; `Workforce-ready people with real evidence`; `Get matched with capable talent
fast`; `Serve, contribute, and build experience`; `For verified organisations offering service
roles`; `Close real skill gaps with guided learning`; and `Follow, share, and grow with
professionals`. Their approved replacement is no description; labels render alone.
