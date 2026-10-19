# Publish INCI Lens

## 1. GitHub

Create an empty private repository named `inci-lens` in your preferred account. Do not initialize it with files if pushing the included source. Give the connected GitHub integration access to this new repository. Then upload the project contents at repository root (not the outer ZIP directory), or use:

```bash
git init -b main
git add .
git commit -m "Build INCI Lens ingredient screening prototype"
git remote add origin https://github.com/YOUR-ACCOUNT/inci-lens.git
git push -u origin main
```

Replace YOUR-ACCOUNT. Use the normal GitHub login flow; do not put access tokens in URLs. The repository includes `.gitignore`, so environment files and node_modules are not added. Before committing check `git status --short`.

## 2. MongoDB Atlas

Create a project and a cluster with a plan you explicitly select. Do not enable paid upgrades automatically. Create a database user restricted to read/write on `inci_lens`; do not use the Atlas account password. Obtain the Node.js driver connection string and securely substitute its database password. Configure network access for the deployment environment, preferably constrained to supported egress addresses. A blanket IP allowlist is not a security substitute for database credentials.

In Vercel project environment settings add `MONGODB_URI` as a sensitive value and `MONGODB_DB=inci_lens`. Never paste credentials into GitHub or client-side variables.

Collections created on first use:

| Collection | Fields / ownership |
| --- | --- |
| reports | tokenHash, report, createdAt; private retrieval code grants access |
| explanations | hash ID, text, createdAt; versioned shared result cache |
| quotas | deterministic daily ID and atomic counter |

For report retrieval performance, create a unique index on `reports.tokenHash`. The `_id` fields on quotas and explanations are already indexed by MongoDB. Choose retention and delete old reports explicitly if required by your institution.

## 3. Vercel

Restore access to the intended workspace. The current connection returned 403 for `swaich-technos-projects` (`team_XdekkOXkni0ULMT2evg6e2Zn`). No deployment was created.

Import the new GitHub repository, choose Vite, Node.js 22, build command `npm run build`, output `dist`, and the project root as the root directory. The `api/` folder is deployed as Node.js serverless functions. Add environment variables before deploying. No separate CDN purchase or MongoDB hosting inside Vercel is required by this architecture.

## 4. Optional AI

Create a Gemini API key in your provider account. Set `GEMINI_API_KEY`, choose an available `GEMINI_MODEL`, and set a long random `AI_ACCESS_CODE`. Set `AI_DAILY_LIMIT` conservatively and configure a provider-side spending budget. Redeploy after environment updates. The shared code is entered by a user, sent in the POST body over HTTPS, and never written to client storage.

## 5. Acceptance checklist

- Paste the sample: fragrance and linalool show potential concern; unlisted phenoxyethanol remains unknown in this deliberately small dataset.
- Analyze an unknown ingredient: never receive a safe classification.
- Upload a sharp English label image and correct OCR output before analysis.
- Download JSON, and use Print / Save as PDF.
- Save a report, retrieve using its code, delete it, then confirm retrieval returns not found.
- Enter the wrong AI code: expect 401. Correct code: short explanation. Repeat: cached response.
- Check requests after the daily cap return 429.
- Confirm no secret appears in page source, generated client JS, Git history or logs.
- Inspect mobile and desktop layouts, keyboard focus and source links.
