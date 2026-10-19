import { INGREDIENTS, SOURCES, VERSION } from "../data/ingredients.js";
export const normalize = (text) =>
  text.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const index = new Map(
  INGREDIENTS.flatMap((item) =>
    [item.name, ...item.aliases].map((name) => [normalize(name), item]),
  ),
);
export function parseLabel(text) {
  if (typeof text !== "string" || text.trim().length < 2)
    throw new Error("Enter an ingredient list first.");
  if (text.length > 12000)
    throw new Error("Please limit the label to 12,000 characters.");
  // Keep commas within parentheses (e.g. botanical names) intact.
  const clean = text.replace(/^\s*ingredients?\s*:\s*/i, "");
  let depth = 0,
    part = "",
    parts = [];
  for (const char of clean) {
    if (char === "(") depth++;
    if (char === ")") depth = Math.max(0, depth - 1);
    if ((char === "," || char === ";" || char === "\n") && depth === 0) {
      parts.push(part);
      part = "";
    } else part += char;
  }
  parts.push(part);
  const unique = [
    ...new Map(
      parts
        .map((p) => p.trim().replace(/\.$/, ""))
        .filter(Boolean)
        .map((p) => [normalize(p), p]),
    ).values(),
  ];
  if (!unique.length) throw new Error("Enter at least one ingredient name.");
  if (unique.length > 150)
    throw new Error("Please use at most 150 ingredients.");
  return unique;
}
export function analyze(text, productType = "leave-on") {
  if (!["leave-on", "rinse-off"].includes(productType))
    throw new Error("Choose a valid product type.");
  const ingredients = parseLabel(text).map((input) => {
    const item = index.get(normalize(input));
    return item
      ? { input, ...item, source: SOURCES[item.source] }
      : {
          input,
          name: input,
          role: "Not in reference dataset",
          category: "unknown",
          note: "Insufficient evidence in this dataset. Unknown does not mean safe or unsafe.",
          source: null,
        };
  });
  const counts = { concern: 0, context: 0, unknown: 0 };
  ingredients.forEach((i) => counts[i.category]++);
  return {
    version: VERSION,
    createdAt: new Date().toISOString(),
    productType,
    ingredients,
    counts,
    coverage: Math.round(
      ((ingredients.length - counts.unknown) / ingredients.length) * 100,
    ),
    classification: counts.concern
      ? "Potential concerns identified"
      : counts.unknown
        ? "Insufficient evidence"
        : "Context needed",
    disclaimer:
      "Educational ingredient screening, not a validated toxicity prediction or medical advice. Concentrations, impurities, exposure and the finished formulation are not assessed.",
  };
}
