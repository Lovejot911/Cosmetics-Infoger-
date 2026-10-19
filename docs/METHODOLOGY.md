# Academic methodology

Suggested title: AI-assisted cosmetic ingredient label analysis with evidence-linked concern classification.

## Pipeline

1. User enters text or runs a pretrained Tesseract OCR model locally.
2. User verifies extracted text.
3. A deterministic parser separates ingredient names, preserves parentheses and slash compounds, normalizes case/whitespace and deduplicates repeated tokens.
4. Exact aliases match a curated reference dataset; no fuzzy auto-correction of chemical names is performed.
5. Rules emit potential concern, context needed or insufficient evidence. The highest-priority finding informs the report heading, not a numerical toxicity score.
6. Optional Gemini produces a plain-language explanation constrained to the report evidence.
7. Reports may be exported or saved to MongoDB using private retrieval codes.

## What the AI does

Tesseract performs pretrained machine-learning OCR. Gemini performs generative explanation. The concern classifier is rule-based; do not describe it as a model trained on toxicology outcomes. No training dataset, held-out accuracy, clinical validation or calibrated risk probability exists in this submission.

If your department requires a trained toxicity classifier, this is an implementation foundation, not completion of that requirement. Add a suitably licensed, endpoint-specific dataset, independently reviewed labels, defensible features, molecular identity resolution and a separate evaluation pipeline. Do not label unknown ingredients as negatives or train on this tiny reference list and report memorization as predictive accuracy.

## Suggested evaluation protocol

- Build a manually transcribed test set of product label photos with permission.
- Measure OCR character/word error rate across glare, angle, font size and blur.
- Measure ingredient segmentation precision/recall against human annotations.
- Evaluate alias resolution separately from classification.
- Use qualified independent reviewers to validate concern evidence and category meaning.
- Report dataset coverage and unmatched ingredient rate; coverage is not accuracy.
- Test malformed input, XSS text, database outages, invalid codes and quota exhaustion.
- Record response latency and bytes transferred on first and repeated visits.

## Limitations

The dataset is small and incomplete. Ingredient roles do not constitute safety evidence. Concentrations, impurities, mixtures, route, frequency, pH, regional restrictions, pregnancy suitability and finished-product safety are not assessed. Leave-on/rinse-off context is recorded but cannot support quantitative exposure estimates. AI can make mistakes; source-linked rules remain visible independently.

## Architecture

Browser: interface + local screening + lazy OCR → optional Vercel APIs → MongoDB and Gemini.
Static assets: Vercel CDN. Private API responses: no-store. Secrets: server environment only.
