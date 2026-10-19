export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "GET required" });
  res
    .status(200)
    .json({
      databaseConfigured: Boolean(process.env.MONGODB_URI),
      aiConfigured: Boolean(
        process.env.GEMINI_API_KEY &&
        process.env.MONGODB_URI &&
        process.env.AI_ACCESS_CODE,
      ),
      mode: "Evidence-linked rules + optional Gemini explanation",
    });
}
