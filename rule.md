# System Rules & Engineering Standards (rule.md)

This document establishes the non-negotiable coding, architectural, performance, and aesthetic standards for **kreepycode**. Every module, function, component, and copy string must adhere strictly to these rules.

---

## 1. Brand Identity & Aesthetic Philosophy ("Anti-AI-Slop" Manifesto)

We build a high-performance, serious developer platform with an architectural, editorial aesthetic. It must look human-engineered, razor-sharp, and timeless.

### Prohibited Aesthetic Anti-Patterns (Strictly Forbidden):
1. **NO Purple Gradients or Neon Glows:** Never use indigo/violet/purple gradient backgrounds, mesh gradients, or "glow/bloom" effects characteristic of generic AI landing pages.
2. **NO Pill-Shaped Buttons:** Buttons must have crisp, deliberate geometry (`rounded-sm` or `rounded-none`), never `rounded-full` pill buttons.
3. **NO Emojis as UI Icons:** Never use emojis (🚀, 💡, 🔥, ⚡, 🧠) as icons or decorations. Use sharp, monochromatic SVG icons (e.g., Lucide React with thin/regular stroke) or minimal geometric indicators.
4. **NO Fake Reviews, Fake Metrics, or Fake Counters:** Never insert fabricated testimonials ("Alex S., Senior Dev"), fake user counts ("Over 50,000 students"), or artificial live activity tickers. If data is not real, it does not exist on the page.
5. **NO Vague or Corporate AI Slop Copy:** No buzzwords like "Supercharge your workflow," "Unleash your potential," "Next-gen AI synergy." Write direct, technical, clear, human English.
6. **NO Em Dashes (—) or Typographic Quirks:** Avoid pretentious punctuation, conversational AI banter, or filler words.
7. **NO Over-The-Top Scroll Animations or Cursor Effects:** No particle trails, tilt cards, magnetic cursor tracking, or scroll-hijacking. Page transitions must be instantaneous (0–150ms micro-transitions maximum).
8. **NO AI Stock Art or 3D Cartoon Characters:** Never use generated cartoon characters, floating isometric 3D shapes, or generic stock illustrations. Use clean editorial code snippets, data tables, or real architectural diagrams.
9. **NO "Made with AI" Badges:** The brand is strictly **kreepycode**.

---

## 2. Frontend Design System & Color Palette

- **Brand Name:** `kreepycode`
- **Background:** Pure Crisp White (`#FFFFFF`). Subtle sectional delineation with `#F8F9FA` or high-contrast hairline borders (`#000000` or `#E5E7EB`).
- **Typography:** Apple typography aesthetic (Inter / Plus Jakarta Sans). High-contrast black bold headings (`#000000`) with varying optical scales and weights (900, 800, 700, 600).
- **Accents:**
  - **Lemon Yellow (`#FAFF00` / `#EEF200`):** Used deliberately for key inline word highlights, status indicators, and selective focal points.
  - **Navy (`#0B1528` / `#0A1128`):** Deep, authoritative navy used for primary action buttons, dark terminal chrome, and high-emphasis controls.
- **Single Global Navigation Header:** One unified, consistent navigation header across the entire application—no jarring redesigns between landing, catalog, and dashboard pages.
- **Launch Prerequisites:**
  - Official custom domain readiness.
  - Vector favicon (`favicon.ico` / `svg`) featuring the official **kreepycode** monogram.
  - Functional Legal pages: `/privacy` (Privacy Policy) and `/terms` (Terms & Conditions).

---

## 3. Performance & Execution Speed Rules

1. **Zero Main-Thread Blocking:**
   - In-browser SQLite WASM execution MUST run inside a **Dedicated Web Worker** so query evaluations never cause UI frame drops.
2. **Zero Unnecessary Re-renders:**
   - Every interactive component must have strict prop identity.
   - Use `React.memo`, `useCallback`, and `useMemo` strictly for expensive evaluations or object props passed down.
   - Never define inline object/array literals inside render loops.
3. **No Layout Shifts (CLS = 0):**
   - Reserve explicit dimensions and skeleton placeholders for video players, Monaco editor instances, and testcase output tables before data resolves.
4. **Dynamic Imports & Code Splitting:**
   - Dependencies like `@monaco-editor/react` and `sql.js` (WebAssembly binary) MUST be dynamically loaded (`next/dynamic` with `ssr: false`).
   - Never bundle WebAssembly binaries or code editors into the initial page load bundle.
5. **Target Complexity Metrics:**
   - Client-side data filtering, test case matching, and streak calculations must operate in **$O(N)$ time** and **$O(1)$ or $O(N)$ auxiliary space**.
   - Output diff algorithms (for SQL tables and DSA test outputs) must use hash-map indexing ($O(R \cdot C)$) rather than nested linear scans ($O(N^2)$).

---

## 4. Code Modularity & Compactness Rules

1. **Single Responsibility Principle (SRP):**
   - No single file may exceed **150-200 lines of code**. If a file grows larger, decompose it into focused sub-components or utility hooks.
2. **Directory Isolation:**
   - `lib/services/` for external APIs and engine abstractions (Piston, Supabase, SQLite WASM).
   - `components/ui/` for atomic, reusable, zero-dependency presentation components.
   - `components/workspace/` for editor, console, and task panels.
   - `hooks/` for isolated state and side-effect logic.
3. **Zero Dead Code Policy:**
   - Unused imports, orphaned types, commented-out testing blocks, and empty fallback functions must be eliminated before committing.
   - Enable TypeScript `noUnusedLocals` and `noUnusedParameters`.
4. **Compact, High-Class Logic:**
   - Prefer declarative, pure functional utilities with clear input/output contracts.
   - Use early returns (`guard clauses`) to minimize nested `if/else` blocks.
   - Keep state trees flat; avoid deeply nested state mutation.

---

## 5. Database & Supabase Security Rules

1. **Row Level Security (RLS) is Mandatory:**
   - Every table in Supabase must have RLS enabled (`alter table ... enable row level security;`).
   - Students may ONLY read/write their own enrollments, submissions, and task completions (`auth.uid() = user_id`).
   - Only users with `role = 'admin'` in `profiles` can create, update, or delete courses, tracks, and tasks.
2. **Index Optimization:**
   - All foreign keys (`course_id`, `track_id`, `day_id`, `user_id`, `task_id`) and lookup fields (`slug`, `day_number`, `next_day_unlock_at`) must have explicit B-tree indexes.
3. **Environment Isolation:**
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components or `NEXT_PUBLIC_*` variables.
   - Admin actions requiring elevated privileges must execute exclusively in Server Actions or Route Handlers with session verification.

---

## 6. Verification & Zero-Mistake Standards

1. **Strict Type Safety:**
   - No `any` types permitted. All API responses, Supabase table payloads, and runner outputs must have strict TypeScript interfaces.
2. **Fault Tolerance:**
   - Network errors during compilation or query execution must fail gracefully with human-friendly error messages (e.g., *"Compiler service unavailable, retrying..."* instead of raw stack traces).
   - Handle edge cases in code execution: infinite loops (timeout after 5 seconds), memory overflow, and missing inputs.
