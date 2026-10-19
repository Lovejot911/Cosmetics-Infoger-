import { analyze } from "../lib/analyze.js";
import { post } from "../lib/http.js";
export default function handler(req, res) {
  const b = post(req, res);
  if (!b) return;
  try {
    res.status(200).json(analyze(b.text, b.productType));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
