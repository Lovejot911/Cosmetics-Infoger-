export function post(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "POST required" });
    return null;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    if (JSON.stringify(body).length > 16000) {
      res.status(413).json({ error: "Request too large" });
      return null;
    }
    return body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return null;
  }
}
