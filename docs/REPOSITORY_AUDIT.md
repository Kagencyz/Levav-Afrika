# Repository Audit

Findings from the initial safety and structure audit conducted before any feature work resumed. All findings below were confirmed by running read-only commands, not assumed.

## 1. Prior repository scoping problem (fixed during this audit)

The project was downloaded into `~/Downloads/Levav Afrika  (1)/`. Before this audit, the only git repository touching this code was rooted at `~/Downloads` itself — one level above the project, and encompassing the user's entire Downloads folder (hundreds of unrelated personal files: installer `.dmg`s, other client project zips, a SQL dump, financial CSVs, photos, logs).

Verified facts about that old repository:
- Only 1 real commit existed ("Initial commit of Kimi app", 2026-06-21), containing exactly the original Kimi-generated `app/` scaffold (240 files) — no personal files were ever part of a real commit.
- `origin/main` (`github.com/Kagencyz/levav-talent.git`) matched that same single commit exactly — **nothing personal was ever pushed to GitHub.**
- However, the git **index** held ~434 staged-then-deleted files and ~227 staged-then-renamed-and-missing files spanning the whole Downloads folder — meaning a broad `git add -A` had been run at some point across all of Downloads, and those file blobs were sitting in the local `.git` object store (2.8GB) uncommitted. Had anyone run `git commit && git push` from that location without cleaning the index first, all of that unrelated personal data would have become permanent, pushed git history.
- The canonical `levav-talent/` folder (this one) was **entirely untracked** in that old repository — it had zero version-control protection.

**Resolution:** a fresh, dedicated git repository was initialized inside `levav-talent/` itself (`git init`, proper `.gitignore` excluding `node_modules/`, `dist/`, `.env`, the stale `node_modules.bak.1417/` backup, etc.), and a clean baseline commit was made (191 files). The old Downloads-rooted repository was left completely untouched — not deleted, not committed to, not pushed to — in case anything there is still needed for reference.

## 2. Duplicate/sibling application folders

Two folders in the parent directory look like Levav Talent codebases:

| Folder | In this repo? | Nature |
|---|---|---|
| `levav-talent/` | Yes — canonical, confirmed by the user | Full-stack: Vite/React frontend + Hono/tRPC/Drizzle/MySQL backend (backend currently disconnected, see `ARCHITECTURE.md`) |
| `app/` (sibling, outside this repo) | No | Frontend-only Vite app from the original Kimi generation; the origin of the old repo's single real commit |

`app/` should be treated as historical reference only, not edited as if it were the live product.

## 3. Method

Read-only commands used to establish the above (no destructive git operations were run at any point):
```
git rev-parse --show-toplevel   # from multiple subdirectories, to find the true repo root
git log --all --oneline --graph
git rev-list --all --count
git branch -a
git stash list
git status --porcelain=v1 | cut -c1-2 | sort | uniq -c
git ls-tree -r HEAD --name-only
git log origin/main --oneline
git rev-parse main origin/main
```

## 4. Outstanding items for the user

- The old `~/Downloads/.git` repository still exists with its bloated index. It was left untouched by design. If it's no longer needed, the user may want to clean or remove it manually — this audit did not do so.
- `~/Downloads/Levav Afrika  (1).zip` and `~/Downloads/Kimi_Agent_Levav Afrika .zip` appear to be original download archives, left untouched.
