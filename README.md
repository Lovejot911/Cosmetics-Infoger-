# INCI Lens

AI-assisted cosmetic ingredient label analysis and concern classification — an educational major-project prototype.

## What works

- Responsive ingredient analyzer and searchable reference notebook.
- Paste INCI labels or use on-demand, browser-side Tesseract OCR (English).
- Exact name / alias matching with source-linked concern, context-needed and unknown categories.
- JSON download and browser Print / Save as PDF.
- MongoDB-backed private-code report saving, retrieval and deletion.
- Optional Gemini explanations with MongoDB cache, access code and global daily quota.
- Vercel serverless API and CDN-ready static frontend.

**Scientific scope:** this is a rule-based screening engine with an optional generative AI explanation layer. It is not a trained or validated toxicity prediction model. No accuracy, clinical safety, regulatory compliance or completeness claim is made. Unknown ingredients remain unknown. Product type is recorded but does not automatically change risk: concentration, pH and exposure data are missing.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm test
npm run dev
```

Vite serves the frontend only. Screening, sample labels, library search, OCR and downloads work without backend credentials. For serverless API development, install Vercel CLI, create `.env.local` from `.env.example`, configure it securely, and use `vercel dev`. Never commit `.env.local`.

## Structure

| Path | Purpose |
| --- | --- |
| `src/` | Responsive client interface and styling |
| `api/` | Vercel Node.js functions |
| `lib/` | Screening, database connection and request validation |
| `data/` | Small, reviewed ingredient reference dataset |
| `tests/` | Screening and API contract tests |
| `public/` | Optimized WebP illustration |
| `docs/` | Deployment and academic methodology |
| `.github/workflows/` | Read-only test/build CI |

Repository conventions: descriptive lowercase names, README, gitignore, example environment file, lockfile, tests, security guidance and CI. Git tracks files, not empty folders. Secrets, dependency folders and build output are excluded. A license is deliberately not chosen on the author's behalf; add your intended license before granting reuse rights.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Vercel builds the static frontend and serves hashed assets through its CDN; API responses use `no-store`. OCR is split into a lazy chunk so the initial page does not download the OCR runtime. The image is compressed to WebP. Fonts use display=swap and fallback fonts.

## Environment

| Variable | Required for |
| --- | --- |
| `MONGODB_URI` | Cloud reports and AI quota/cache |
| `MONGODB_DB` | Optional database name; defaults to `inci_lens` |
| `GEMINI_API_KEY` | Optional Gemini explanation |
| `GEMINI_MODEL` | Optional model ID; default `gemini-3.8-flash`, verify availability in your account |
| `AI_ACCESS_CODE` | Required shared access code for AI requests |
| `AI_DAILY_LIMIT` | Global uncached requests per UTC day, default 30, hard maximum 100 |

No credential is needed for local screening. Google consumer AI subscriptions do not automatically configure this API. Configure your provider budget separately; this app's quota is not a billing guarantee. Failed provider requests consume a quota slot to avoid runaway retries.

## Privacy and operational limits

Photos are processed locally by OCR; language/worker resources are downloaded from third-party CDNs on first use. AI sends the screening report to Google only when requested. Cloud save stores the ingredient report, not the uploaded image, access code or product name. A cryptographically random 192-bit code grants access to that report; the database stores only its hash. Losing the code loses access. Anyone possessing it can retrieve or delete the report. No public listing endpoint exists.

This is a student-project access model, not full user authentication. Before broad public launch add accounts, per-user quotas, rate limiting, retention policy, abuse protection and monitoring. A global cloud-save cap of 500 reports/day prevents unbounded writes but is not per-user protection. Current server collections contain no automatic retention deletion; use the delete control or an administrator-defined retention policy.

## Validation status

Production build and local automated tests passed. BrowserAct installed but its command daemon failed to start, so real-browser layout/OCR verification remains pending. Live MongoDB and Gemini integration tests remain pending because credentials were not supplied. Vercel deployment was blocked by a 403 authorization response for the existing workspace. No GitHub upload has been completed: the connected account exposes an unrelated existing repository and no repository-creation tool.

## Reference sources

- FDA allergens: https://www.fda.gov/cosmetics/cosmetic-ingredients/allergens-cosmetics
- FDA fragrance: https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics
- FDA AHA: https://www.fda.gov/cosmetics/cosmetic-ingredients/alpha-hydroxy-acids
- European Commission CosIng: https://ec.europa.eu/growth/tools-databases/cosing/
- GitHub repository guidance: https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories
- Vercel CDN: https://vercel.com/docs/caching/cdn-cache
- MongoDB driver: https://www.mongodb.com/docs/drivers/node/current/connect/
- Gemini API: https://ai.google.dev/gemini-api/docs/text-generation

General ingredient roles are curated educational labels; CosIng is a reference lookup, not a per-ingredient safety endorsement. Review and expand the dataset under qualified supervision before making assessment claims.
