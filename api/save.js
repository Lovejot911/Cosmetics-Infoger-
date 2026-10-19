import { randomBytes, createHash } from "node:crypto";
import { database } from "../lib/db.js";
import { analyze } from "../lib/analyze.js";
import { post } from "../lib/http.js";
export default async function handler(req, res) {
  const b = post(req, res);
  if (!b) return;
  let report;
  try {
    report = analyze(b.text, b.productType);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  if (!process.env.MONGODB_URI)
    return res
      .status(503)
      .json({
        error: "Cloud saving is not configured. Download the report instead.",
      });
  try {
    const db = await database();
    const bucket = new Date().toISOString().slice(0, 10);
    const quotas = db.collection("quotas");
    await quotas.updateOne(
      { _id: "save:" + bucket },
      { $setOnInsert: { count: 0 } },
      { upsert: true },
    );
    const slot = await quotas.findOneAndUpdate(
      { _id: "save:" + bucket, count: { $lt: 500 } },
      { $inc: { count: 1 } },
    );
    if (!slot)
      return res.status(429).json({ error: "Daily cloud save limit reached." });
    const token = randomBytes(24).toString("hex");
    await db
      .collection("reports")
      .insertOne({
        tokenHash: createHash("sha256").update(token).digest("hex"),
        report,
        createdAt: new Date(),
      });
    res
      .status(201)
      .json({
        token,
        message: "Saved to MongoDB. Keep this private retrieval code.",
      });
  } catch {
    return res
      .status(503)
      .json({
        error: "Cloud saving is unavailable. Download your report instead.",
      });
  }
}
