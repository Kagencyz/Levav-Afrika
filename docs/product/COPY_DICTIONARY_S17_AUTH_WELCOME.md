# Copy Dictionary §17 — Auth, Welcome, global states

**Owner:** Claude. **Issued for:** WP-0004 Amendment A1. **Status:** APPROVED, verbatim.

Authored against the actual files on `main` at `d5134e4`. Every user-facing string in the WP-0004 migration scope has a key here. Codex invents nothing.

Existing §1 keys (`auth.signup.*`, `auth.login.*`, `auth.verify.title/body/ratelimited`, `auth.error.credentials`) remain valid and are **not** redefined here.

---

## 17.1 Auth — headings and mode

| Key | Value |
|---|---|
| `auth.talent.signin.title` | Welcome back |
| `auth.talent.signin.subtitle` | Sign in to continue. |
| `auth.talent.signup.title` | Join Levav |
| `auth.talent.signup.subtitle` | Create your Levav ID and start building evidence of what you can do. |
| `auth.employer.signup.title` | Create an employer account |
| `auth.employer.signup.subtitle` | Confirm your work email, then register your organisation. |
| `auth.switch.tosignin.prompt` | Already have an account? |
| `auth.switch.tosignin.action` | Sign in |
| `auth.switch.tosignup.prompt` | New to Levav? |
| `auth.switch.tosignup.action` | Create an account |

## 17.2 Auth — fields

| Key | Value |
|---|---|
| `auth.field.firstname` | First name |
| `auth.field.lastname` | Last name |
| `auth.field.email` | Email address |
| `auth.field.password` | Password |
| `auth.field.confirmpassword` | Confirm password |
| `auth.placeholder.email` | you@example.com |
| `auth.placeholder.password` | Enter your password |
| `auth.placeholder.confirmpassword` | Enter your password again |
| `auth.password.requirement` | At least 6 characters. |

## 17.3 Auth — validation

Field-level, shown beneath the field.

| Key | Value |
|---|---|
| `auth.validation.firstname.required` | Enter your first name. |
| `auth.validation.lastname.required` | Enter your last name. |
| `auth.validation.email.required` | Enter your email address. |
| `auth.validation.email.invalid` | That does not look like an email address. |
| `auth.validation.password.required` | Enter a password. |
| `auth.validation.password.tooshort` | Use at least 6 characters. |
| `auth.validation.confirmpassword.required` | Enter your password again. |
| `auth.validation.password.mismatch` | These two passwords do not match. |

## 17.4 Auth — email confirmation and resend

| Key | Value |
|---|---|
| `auth.verify.heading` | Check your email |
| `auth.verify.sentto` | We sent a confirmation link to {email}. |
| `auth.verify.action.signin` | I have confirmed my email — sign in |
| `auth.verify.resend.action` | Resend confirmation email |
| `auth.verify.resend.sending` | Sending |
| `auth.verify.resend.sent` | A new confirmation email is on its way. |
| `auth.verify.resend.toosoon` | Wait a moment before requesting another email. |
| `auth.verify.resend.failed` | That email could not be sent. Check your connection and try again. |
| `auth.verify.confirmed` | Your email is confirmed. Sign in to continue. |
| `auth.verify.expired` | That confirmation link has expired. Request a new one below. |

## 17.5 Auth — outcomes

| Key | Value |
|---|---|
| `auth.success.registered` | Your Levav ID is created. Confirm your email to continue. |
| `auth.success.signedin` | Signed in. |
| `auth.error.duplicate` | That email address already has an account. Sign in instead. |
| `auth.error.ratelimited` | Too many confirmation emails have been sent to this address. Wait an hour and try again. |
| `auth.error.generic` | Something went wrong on our side. Try again in a moment. |
| `auth.error.offline` | You are offline. Levav will not lose what you typed — reconnect and try again. |

## 17.6 Welcome — first-run

`/welcome` is the two-step first-run flow. It reuses `onboarding.intentions.*` and `onboarding.situation.*` from §16 for its questions; only Welcome-specific chrome is defined here.

| Key | Value |
|---|---|
| `welcome.title` | Welcome to Levav |
| `welcome.step` | Step {current} of {total} |
| `welcome.goals.heading` | Your goals |
| `welcome.status.heading` | Where you are now |
| `welcome.primary.badge` | Primary |
| `welcome.primary.help` | Your first choice decides where Levav takes you next. You can change it later. |
| `welcome.action.continue` | Continue |
| `welcome.action.back` | Back to goals |
| `welcome.action.finish` | Take me there |
| `welcome.saving` | Setting up your account |
| `welcome.done` | Your Levav ID is ready. |
| `welcome.error` | We could not save that. Your choices are still here — try again. |

**Superseded:** §1's `onboarding.goals.title`, `onboarding.goals.subtitle` and `onboarding.status.title` are superseded by §16's `onboarding.intentions.title`, `onboarding.intentions.help` and `onboarding.situation.title`. Use §16. The §1 keys are retained only until WP-0102 removes them.

## 17.7 Intention labels — transitional

§16 defines `intent.*` for the nine intentions PDR-0014 approves. Eight of the nine shipped goal slugs map to them directly. One does not, and gets a key here so no slug is left without approved copy before WP-0102 migrates the data.

| Shipped slug | Use this key |
|---|---|
| `develop` | `intent.develop` |
| `find-job` | `intent.find_work` |
| `find-quickwork` | `intent.find_quickwork` |
| `learn` | `intent.learn` |
| `find-volunteer` | `intent.contribute` |
| `community` | `intent.network` |
| `hire` | `intent.hire` |
| `post-quickwork` | `intent.post_quickwork` |
| `post-volunteer` | **`intent.post_contribution`** (new, below) |

| Key | Value |
|---|---|
| `intent.post_contribution` | Publish contribution opportunities |

**Goal descriptions.** The shipped `desc` field is retired — §16's labels are self-explanatory and the descriptions carried prohibited vocabulary. Render the label alone. Where a hint is genuinely needed, use `onboarding.intentions.help`.

## 17.8 Situation labels — transitional

§16 defines `situation.*` for the seven values PDR-0014 approves. Two shipped enum values are removed by that PDR but still exist in the database until WP-0102 migrates. They get transitional labels so nothing renders unlabelled.

| Shipped slug | Use this key |
|---|---|
| `employed` | `situation.employed` |
| `self_employed` | `situation.self_employed` |
| `freelancing` | `situation.freelancing` |
| `studying` | `situation.studying` |
| `unemployed` | `situation.not_working` |
| `returning_to_work` | `situation.career_break` |
| `running_organization` | `situation.running_organisation` |
| `volunteering` | **`situation.legacy.volunteering`** |
| `changing_careers` | **`situation.legacy.changing_careers`** |

| Key | Value |
|---|---|
| `situation.legacy.volunteering` | Contributing my time |
| `situation.legacy.changing_careers` | Changing direction |

Both legacy keys are **deleted by WP-0102** along with the enum values. They exist only so no shipped value renders without approved copy in the interim.

## 17.9 Global — not found

| Key | Value |
|---|---|
| `notfound.code` | 404 |
| `notfound.title` | This page does not exist |
| `notfound.body` | The link may be out of date, or the page may have moved. |
| `notfound.path` | You asked for: {path} |
| `notfound.action.back` | Go back |
| `notfound.action.home` | Go to your home page |

**Superseded:** §0's `global.error.notfound.title` and `global.error.notfound.body` are superseded by `notfound.*`, which the actual page needs at greater specificity. Remove the §0 pair when WP-0004 lands.

## 17.10 Global — offline

| Key | Value |
|---|---|
| `global.offline.banner` | You are offline. Levav will save what you do and sync it when you reconnect. |

Distinct from §0's `global.error.network.*`, which is a blocking error state. This is a persistent, non-blocking banner.

---

**Prohibited across all of the above:** "gig" in any form, "volunteer" as a person's identity, exclamation marks, "journey" as marketing filler, "Oops", and any promise of a timeline Levav cannot honour.

## 17.11 Auth — sign-in throttle

**Approved 2026-08-14**, resolving the open decision in the WP-0004 implementation report. These are **not exempt** from Criterion 3 — they are user-facing strings on the most security-sensitive surface in the product, which is where wording matters most.

The three shipped strings collapse to **two keys**. `Too many attempts. Please wait {seconds} seconds.` and `Too many attempts. Please wait {seconds} seconds before retrying.` are the same message written twice; carrying both is precisely the drift the copy module exists to prevent.

| Key | Value |
|---|---|
| `auth.throttle.message` | Too many sign-in attempts. For your security, wait {seconds} seconds before trying again. |
| `auth.throttle.action` | Wait {seconds}s |

`auth.throttle.message` replaces both sentence forms. `auth.throttle.action` is the countdown on the disabled button and stays terse because it sits inside a control.

**Why the wording changed.** "Too many attempts" alone reads as an accusation aimed at the person, when the actual cause is usually a mistyped password. Naming the reason — *for your security* — turns a rebuke into an explanation, and the throttle is a protection for the account holder, so it should read like one.

**The security behaviour does not change.** This is a copy substitution only. Throttle timing, counters and lockout logic stay exactly as they are.

## 17.12 Onboarding — confirming a migrated situation

**Approved 2026-08-15**, for defect D-0102-1. PDR-0014 retired `volunteering` and `changing_careers` as employment situations and merged `returning_to_work` into `career_break`. Migration 0007 remaps existing rows and flags them `situation_inferred = true`.

ONB-001 forbids silent reclassification, so a member whose answer was rewritten must be **told and asked**, not quietly reassigned.

| Key | Value |
|---|---|
| `onboarding.situation.inferred.title` | Check how Levav describes your situation |
| `onboarding.situation.inferred.body` | We changed the options for describing work situations. Your previous answer no longer has an exact match, so Levav has put you down as "{situation}". Nothing uses this until you confirm it. |
| `onboarding.situation.inferred.confirm` | That is right |
| `onboarding.situation.inferred.change` | Choose a different one |

The body states three things deliberately: that Levav changed something, what it assumed on the member's behalf, and that the assumption is inert until confirmed. Dropping any one of them turns an honest prompt back into a silent reclassification with a dialog attached.
