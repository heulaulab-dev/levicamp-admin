---
description: Audit Next.js 15 + React 19 frontend for best practices, performance, security, and bundle health
allowed-tools: Read, Grep, Glob, Bash(find *), Bash(cat *), Bash(wc *)
---

# Frontend Audit — Next.js 15 / React 19 / TypeScript

You are a senior frontend engineer auditing a production-grade Next.js app. Be brutally honest. No generic advice — every finding must reference an actual file and line.

## Step 1 — Inventory

- !`find . -type f -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v .turbo | wc -l`
- !`find . -type f -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | head -80`
- !`cat package.json`
- !`find . -name "next.config.*" | grep -v node_modules`
- !`cat next.config.ts 2>/dev/null || cat next.config.js 2>/dev/null || cat next.config.mjs 2>/dev/null`
- !`find . -name "tsconfig.json" | grep -v node_modules | head -3`
- !`cat tsconfig.json`

## Step 2 — Architecture & Structure

- !`find . -type d | grep -v node_modules | grep -v .next | grep -v .git | grep -v .turbo`
- !`find ./app -name "page.tsx" | grep -v node_modules`
- !`find ./app -name "layout.tsx" | grep -v node_modules`
- !`find ./app -name "loading.tsx" -o -name "error.tsx" -o -name "not-found.tsx" | grep -v node_modules`
- !`find . -name "middleware.ts" | grep -v node_modules`

Check:
- Does the project follow App Router conventions properly?
- Is there clear separation: components/, hooks/, lib/, services/, types/?
- Are page components thin (just layout + data fetching)?
- Is middleware.ts present and handling auth/redirects?

## Step 3 — TypeScript Strictness

- !`cat tsconfig.json | grep -A5 '"strict"'`
- !`grep -rn "any" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next | grep -v "// eslint" | wc -l`
- !`grep -rn ": any" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "as any\|@ts-ignore\|@ts-nocheck" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next`
- !`grep -rn "eslint-disable" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next`

## Step 4 — Next.js 15 Specific

- !`grep -rn "use client" --include="*.tsx" . | grep -v node_modules | grep -v .next | wc -l`
- !`grep -rn "use server" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next`
- !`grep -rn "useEffect\|useState\|useCallback\|useMemo" --include="*.tsx" . | grep -v node_modules | grep -v .next | wc -l`
- !`find ./app -name "*.tsx" | xargs grep -L "use client" | grep -v node_modules | grep -v layout | grep -v page | head -20`
- !`grep -rn "fetch(" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | head -20`

Check:
- Are 'use client' directives used minimally and correctly?
- Are Server Components used for data fetching where possible?
- Are Server Actions used or is everything client-side fetch?
- Is fetch() used with proper caching (cache, next.revalidate)?
- Are there components that should be Server Components but are marked 'use client'?

## Step 5 — Bundle & Dependency Health

- !`cat package.json | grep -A200 '"dependencies"'`

Check and flag:
- Two toast libraries: Sonner AND React Toastify — pick one
- Two animation libraries: Framer Motion AND Motion — are both needed?
- Two CSS-in-JS systems: Emotion AND Tailwind AND MUI — triple styling system is a bundle nightmare
- MUI 6 + Radix UI both present — likely duplicated component logic
- React Scan in dependencies (should be devDependency only)
- @next/third-parties usage — is it configured correctly for performance?

## Step 6 — Performance

- !`grep -rn "import \* as" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "from 'framer-motion'\|from 'motion'" --include="*.tsx" . | grep -v node_modules | head -20`
- !`grep -rn "from '@mui/material'" --include="*.tsx" . | grep -v node_modules | head -20`
- !`grep -rn "dynamic(" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next`
- !`grep -rn "next/image\|<img " --include="*.tsx" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "loading=\"lazy\"\|priority" --include="*.tsx" . | grep -v node_modules | head -20`
- !`grep -rn "useEffect\(\(\) =>" --include="*.tsx" . | grep -v node_modules | grep -v .next | wc -l`

Check:
- Heavy components (charts, PDF, Lottie, confetti) — are they lazy loaded with dynamic()?
- MUI imports — are they tree-shakeable (named imports) or barrel imports?
- Images — using next/image everywhere? Any raw <img> tags?
- Above-fold images — have priority prop?
- Unnecessary useEffect chains (data fetching that should be Server Component)

## Step 7 — State Management

- !`grep -rn "from 'zustand'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l`
- !`find . -name "*.store.ts" -o -name "store.ts" -o -name "*Store.ts" | grep -v node_modules`
- !`grep -rn "create(" --include="*.ts" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "localStorage\|sessionStorage\|cookies" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next`

Check:
- Is Zustand store split by domain or one giant store?
- Is server state managed by Zustand (wrong) or fetch/cache (correct)?
- Are auth tokens stored in localStorage (risky) or httpOnly cookies?
- Is there state that should be URL state (useSearchParams) but is in Zustand?

## Step 8 — Forms & Validation

- !`grep -rn "useForm\|zodResolver" --include="*.tsx" . | grep -v node_modules | wc -l`
- !`grep -rn "from 'zod'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | head -20`
- !`grep -rn "\.parse\|\.safeParse" --include="*.tsx" --include="*.ts" . | grep -v node_modules | head -10`

Check:
- Are Zod schemas defined once and reused (lib/validations/) or inline per form?
- Are schemas shared with backend types or duplicated?
- Is .parse() used without try/catch (throws on failure)?

## Step 9 — Security

- !`grep -rn "dangerouslySetInnerHTML" --include="*.tsx" . | grep -v node_modules`
- !`grep -rn "localStorage.setItem.*token\|localStorage.*jwt\|localStorage.*auth" --include="*.tsx" --include="*.ts" . | grep -v node_modules`
- !`grep -rn "process.env" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "NEXT_PUBLIC_" --include="*.tsx" --include="*.ts" . | grep -v node_modules | head -20`
- !`cat .env.example 2>/dev/null || cat .env.local.example 2>/dev/null || echo "NO .env.example FOUND"`

Check:
- Any dangerouslySetInnerHTML without sanitization?
- Auth tokens in localStorage? (Should be httpOnly cookie)
- Private env vars (non NEXT_PUBLIC_) used in client components?
- .env.example exists and is up to date?
- API base URLs hardcoded or from env?

## Step 10 — Accessibility

- !`grep -rn "aria-\|role=" --include="*.tsx" . | grep -v node_modules | grep -v .next | wc -l`
- !`grep -rn "<button\|<a " --include="*.tsx" . | grep -v node_modules | grep -v .next | head -20`
- !`grep -rn "onClick.*div\|onClick.*span" --include="*.tsx" . | grep -v node_modules | head -10`

Check:
- onClick on div/span instead of button (not keyboard accessible)
- Images missing alt text
- Form inputs missing labels
- Radix UI used correctly (accessible primitives)? Or bypassed with custom divs?

## Step 11 — API Layer

- !`find . -name "*.service.ts" -o -name "api.ts" -o -name "axios*" | grep -v node_modules | head -10`
- !`grep -rn "axios\|fetch(" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | wc -l`
- !`grep -rn "baseURL\|BASE_URL\|API_URL" --include="*.ts" --include="*.tsx" . | grep -v node_modules | head -10`
- !`grep -rn "catch\|\.catch\|try {" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | wc -l`

Check:
- Is Axios configured centrally (interceptors, base URL, auth header injection)?
- Or is each component doing its own fetch/axios with hardcoded URLs?
- Is error handling centralized (response interceptor) or per-call?
- Are API types defined (response shapes) or using `any`?

## Step 12 — Testing

- !`find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | grep -v node_modules | grep -v .next`
- !`cat package.json | grep -A5 '"test"'`

Check:
- Is there any test coverage at all?
- Are critical flows tested (auth, booking, payment)?

---

## Output: Audit Report

Produce a structured report:

### 🔴 CRITICAL (fix before launch)
Each item: **File:line** — Problem — Fix

### 🟠 HIGH (fix this sprint)
Each item: **File:line** — Problem — Fix

### 🟡 MEDIUM (next cycle)

### 🟢 GOOD (what's already right — specific, not generic)

### 📦 Bundle Concerns
List specific duplicate/redundant dependencies with estimated bundle impact.

### 📊 Scores
| Category | Score | Notes |
|---|---|---|
| Architecture | /10 | |
| Performance | /10 | |
| TypeScript Quality | /10 | |
| Security | /10 | |
| Accessibility | /10 | |
| Bundle Health | /10 | |
| Testing | /10 | |
| Overall | /10 | |

### 🎯 Top 5 Things to Fix First
With file paths and example fixes.

### 🚨 Launch Blockers
Only items that are CRITICAL and would cause user-facing failure, data leak, or major performance regression at launch.