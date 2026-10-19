import test from "node:test";
import assert from "node:assert/strict";
import { analyze, parseLabel } from "../lib/analyze.js";
test("unknown ingredients are never classified safe", () => {
  const r = analyze("Unlisted botanical");
  assert.equal(r.counts.unknown, 1);
  assert.equal(r.classification, "Insufficient evidence");
});
test("aliases match and repeat tokens deduplicate", () => {
  const r = analyze("Water, fragrance, Linalool, linalool");
  assert.equal(r.ingredients.length, 3);
  assert.equal(r.ingredients[0].name, "Aqua");
  assert.equal(r.counts.concern, 2);
});
test("parenthetical commas and slash names are preserved", () =>
  assert.deepEqual(
    parseLabel(
      "Ingredients: Extract (leaf, flower), Caprylic/Capric Triglyceride",
    ),
    ["Extract (leaf, flower)", "Caprylic/Capric Triglyceride"],
  ));
test("bad inputs are rejected", () => {
  for (const x of [null, "", "a", "x".repeat(12001)])
    assert.throws(() => analyze(x));
  assert.throws(() => analyze("Aqua", "invalid"));
});
test("basic match does not assert safety", () => {
  const r = analyze("Glycerin");
  assert.equal(r.classification, "Context needed");
  assert.equal(r.coverage, 100);
});
test("HTML is not interpreted by analyzer and remains unknown", () =>
  assert.equal(analyze("<script>alert(1)</script>").counts.unknown, 1));
test("oversized ingredient count rejected", () =>
  assert.throws(() =>
    analyze(Array.from({ length: 151 }, (_, i) => "x" + i).join(",")),
  ));

test('delimiter-only labels cannot produce a report', () => {
  assert.throws(() => analyze(' , ; , '));
  assert.throws(() => analyze('Ingredients:'));
});
