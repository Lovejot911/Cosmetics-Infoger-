import { createHash } from "node:crypto";
import { database } from "../lib/db.js";
import { post } from "../lib/http.js";
export default async function handler(req, res) {
  const b = post(req, res);
  if (!b) return;
  if (typeof b.token !== "string" || !/^[a-f0-9]{48}$/.test(b.token))
    return res.status(400).json({ error: "Invalid retrieval code" });
  try {
    const db = await database();
    const filter = {
      tokenHash: createHash("sha256").update(b.token).digest("hex"),
    };
    if (b.action === "delete") {
      const r = await db.collection("reports").deleteOne(filter);
      return res
        .status(r.deletedCount ? 200 : 404)
        .json(
          r.deletedCount ? { deleted: true } : { error: "Report not found" },
        );
    }
    const r = await db
      .collection("reports")
      .findOne(filter, { projection: { report: 1 } });
    res
      .status(r ? 200 : 404)
      .json(r ? r.report : { error: "Report not found" });
  } catch {
    res.status(503).json({ error: "Cloud reports are unavailable." });
  }
}
