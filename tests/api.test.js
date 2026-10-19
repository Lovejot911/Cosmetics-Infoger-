import test from "node:test";
import assert from "node:assert/strict";
import analyze from "../api/analyze.js";
import save from "../api/save.js";
import report from "../api/report.js";
import explain from "../api/explain.js";
const response = () => ({
  headers: {},
  code: 200,
  data: null,
  setHeader(k, v) {
    this.headers[k] = v;
  },
  status(c) {
    this.code = c;
    return this;
  },
  json(d) {
    this.data = d;
    return this;
  },
});
test("API rejects GET and malformed JSON", () => {
  for (const req of [{ method: "GET" }, { method: "POST", body: "{" }]) {
    const r = response();
    analyze(req, r);
    assert.ok(r.code >= 400);
    assert.equal(r.headers["Cache-Control"], "no-store");
  }
});
test("API gives evidence report for valid input", () => {
  const r = response();
  analyze({ method: "POST", body: { text: "Aqua, Linalool" } }, r);
  assert.equal(r.code, 200);
  assert.equal(r.data.counts.concern, 1);
});
test("missing configuration fails explicitly, not with fake save/AI", async () => {
  delete process.env.MONGODB_URI;
  delete process.env.GEMINI_API_KEY;
  for (const handler of [save, explain]) {
    const r = response();
    await handler({ method: "POST", body: { text: "Aqua" } }, r);
    assert.equal(r.code, 503);
  }
});
test("retrieval rejects invalid capability code", async () => {
  const r = response();
  await report({ method: "POST", body: { token: "guess" } }, r);
  assert.equal(r.code, 400);
});
