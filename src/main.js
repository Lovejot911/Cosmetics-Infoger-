import "./style.css";
import { analyze } from "../lib/analyze.js";
import { INGREDIENTS, SOURCES } from "../data/ingredients.js";
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let current = null,
  submitted = null,
  filter = "all",
  status = {};
const labels = {
  concern: "Potential concern",
  context: "Context needed",
  unknown: "Insufficient evidence",
};
$("#app").innerHTML = `
<header><a class="brand" href="#"><span class="brandmark">i<span>l</span></span>INCI<span class="brandlight">Lens</span></a><nav aria-label="Main navigation"><a class="active" href="#analyzer">Label analyzer</a><a href="#method">Our approach</a><a href="#library">Ingredient library</a></nav><span class="project-tag">RESEARCH EDITION <i></i></span></header>
<main><section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> CLARITY FOR YOUR SKINCARE</div><h1>Read between<br>the <em>ingredients.</em></h1><p>Turn a complicated label into a clearer picture.<br>Explore what’s inside, what to look out for,<br>and what the evidence actually says.</p><a class="primary start" href="#analyzer">Explore your ingredients <span>↗</span></a><div class="hero-foot"><span>◎ Evidence-linked</span><span>◈ Privacy-minded</span><span>✧ AI-assisted</span></div></div><div class="hero-image"><img src="/skincare.webp" alt="Serum and cream with a botanical leaf in soft daylight" width="960" height="640" fetchpriority="high"><div class="image-label"><span class="little-icon">⌕</span><div><strong>A little more understanding.</strong><small>A more informed routine.</small></div></div><span class="image-number">01 / THE INGREDIENT EDIT</span></div></section>
<section id="analyzer" class="workspace"><div class="section-heading"><div><div class="eyebrow">YOUR LABEL, EXPLAINED</div><h2>What’s in your formula?</h2></div><span class="step">01 Input <b>—</b> 02 Understand</span></div><div class="work-grid"><form id="label-form" class="card input-card"><div class="tabs"><button class="selected" id="text-tab" type="button">Aa &nbsp; Paste ingredients</button><label class="upload" for="photo">⌑ &nbsp; Scan a label<input id="photo" type="file" accept="image/png,image/jpeg,image/webp" hidden></label></div><div class="field"><label for="product-name">Product name <span>optional</span></label><input id="product-name" maxlength="100" placeholder="e.g. My daily moisturizer"></div><div class="field"><label for="ingredients">Ingredient list <span>as shown on the label</span></label><textarea id="ingredients" required maxlength="12000" placeholder="Aqua, Glycerin, Niacinamide, Panthenol, Parfum…"></textarea><div class="input-meta"><span>Separate ingredients with commas.</span><span id="char-count">0 / 12,000</span></div></div><div class="field"><label for="product-type">How is it used?</label><select id="product-type"><option value="leave-on">Leave-on · creams, serums, lotions</option><option value="rinse-off">Rinse-off · cleansers, shampoos</option></select></div><button class="primary analyze-button" type="submit">Analyze ingredients <span>→</span></button><p class="sample-line">Just exploring? <button type="button" class="text-button" id="sample">Try a sample label ↗</button></p><p class="micro">Photo reading runs in your browser. Review extracted text before analysis. Screening runs locally; cloud saving and AI are optional.</p><div id="input-status" role="status" aria-live="polite"></div></form>
<div class="card result-card" id="result-panel"><div class="empty"><span class="empty-orbit">✧</span><span class="eyebrow">LESS GUESSWORK. MORE CONTEXT.</span><h3>Your formula,<br>in focus.</h3><p>Add an ingredient list to see potential concerns, supporting sources and gaps in the evidence.</p><div class="legend"><span><i class="dot concern"></i>Potential concern</span><span><i class="dot context"></i>Context needed</span><span><i class="dot unknown"></i>Insufficient evidence</span></div></div></div></div><div class="note"><span>ⓘ</span><p><strong>A label is a starting point.</strong> Concentration, exposure and formulation matter. This educational tool screens ingredients; it does not determine whether a finished product is safe or toxic.</p></div></section>
<section id="method" class="method"><div class="section-heading"><div><div class="eyebrow">TRANSPARENT BY DESIGN</div><h2>Understanding, without the alarm.</h2></div></div><div class="method-grid"><article><span>01 / READ</span><h3>Start with the label</h3><p>Paste an INCI list or extract text from a photo. Correct any reading errors before continuing.</p></article><article><span>02 / CHECK</span><h3>Follow the evidence</h3><p>Exact ingredient and alias matches connect to a small reference dataset. Unmatched names stay unknown.</p></article><article><span>03 / UNDERSTAND</span><h3>Keep the context</h3><p>Optional AI explains the findings. It does not replace the evidence or generate a medical safety verdict.</p></article></div></section>
<section id="library" class="library card"><div class="section-heading"><div><div class="eyebrow">LOOK A LITTLE CLOSER</div><h2>The ingredient notebook</h2></div><span>${INGREDIENTS.length} starter references</span></div><label class="sr-only" for="search">Search ingredient library</label><input id="search" type="search" placeholder="Search by ingredient name or alias…"><div id="library-results"></div><p class="micro">A curated educational starter dataset, not a comprehensive toxicology database. Reviewed 19 October 2026. Categories are heuristic screening labels; no predictive accuracy is claimed.</p></section>
<section class="cloud card"><div><div class="eyebrow">YOUR SAVED ANALYSIS</div><h2>Pick up where you left off.</h2><p>Retrieve or delete a cloud report using its private code.</p></div><form id="retrieve-form"><label class="sr-only" for="report-token">Private retrieval code</label><input id="report-token" autocomplete="off" placeholder="Paste your private retrieval code" required pattern="[a-f0-9]{48}"><div class="inline-actions"><button class="secondary" type="submit">Retrieve report</button><button class="text-button" id="delete-report" type="button">Delete report</button></div><p id="cloud-status" role="status"></p></form></section>
</main><footer><a class="brand" href="#">INCI<span class="brandlight">Lens</span></a><span>Made for curiosity. Grounded in context.</span><a href="https://www.fda.gov/cosmetics/cosmetic-ingredients/allergens-cosmetics" target="_blank" rel="noreferrer">Explore the sources ↗</a></footer>`;
function message(id, text) {
  $(id).textContent = text;
}
async function api(path, body) {
  const r = await fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(28000),
  });
  let d;
  try {
    d = await r.json();
  } catch {
    throw new Error(
      "Cloud service unavailable. Local screening and downloads still work.",
    );
  }
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}
function download() {
  const blob = new Blob(
    [
      JSON.stringify(
        { ...current, productName: submitted?.name || "" },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "inci-lens-report.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function rows() {
  const list = current.ingredients.filter(
    (i) => filter === "all" || i.category === filter,
  );
  $("#ingredient-rows").innerHTML = list.length
    ? list
        .map(
          (i) =>
            `<details class="ingredient-row"><summary><span><strong>${esc(i.name)}</strong><small>${esc(i.role)}</small></span><span class="badge ${i.category}">${labels[i.category]}</span></summary><p>${esc(i.note)}</p>${i.source ? `<a class="source" href="${esc(i.source.url)}" target="_blank" rel="noreferrer">${esc(i.source.title)} ↗</a>` : ""}</details>`,
        )
        .join("")
    : "<p>No ingredients in this category.</p>";
}
function renderReport() {
  filter = "all";
  $("#result-panel").innerHTML =
    `<div class="result-head"><span class="eyebrow">YOUR INGREDIENT REPORT</span><span class="report-tag">Reference screening</span></div><h3>${esc(submitted?.name || "Your formula, decoded.")}</h3><p class="classification">${esc(current.classification)}</p><div class="stats"><div><b>${current.ingredients.length}</b><span>ingredients</span></div><div><b>${current.counts.concern}</b><span>potential concerns</span></div><div><b>${current.coverage}%</b><span>reference coverage</span></div></div><p class="micro">Coverage means matched names, not confidence or safety. Product use: ${esc(current.productType)}.</p><div class="filters" aria-label="Filter results">${[
      ["all", "All"],
      ["concern", "Concerns"],
      ["context", "Context"],
      ["unknown", "Unknown"],
    ]
      .map(
        ([v, l]) =>
          `<button type="button" data-filter="${v}" class="${v === "all" ? "selected" : ""}">${l}</button>`,
      )
      .join(
        "",
      )}</div><div id="ingredient-rows"></div><div class="report-actions"><button class="secondary" id="download">Download JSON ↓</button><button class="secondary" id="print">Print / PDF</button><button class="secondary" id="save" ${!submitted ? "disabled" : ""}>Save to cloud</button></div><p class="micro" id="save-status" role="status"></p><details class="ai-box"><summary>✧ &nbsp; AI explanation <span>Optional</span></summary><p class="micro">Sends this report to Google Gemini when enabled. Requires the project access code. The evidence report above remains authoritative.</p><label for="access-code">Project AI access code</label><input id="access-code" type="password" autocomplete="off"><button class="secondary" id="explain" ${!submitted ? "disabled" : ""}>Explain these findings</button><p id="ai-status" role="status">${status.aiConfigured ? "AI is configured." : "AI is not configured on this deployment yet."}</p></details><p class="micro">${esc(current.disclaimer)}</p>`;
  rows();
  document.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        document
          .querySelectorAll("[data-filter]")
          .forEach((x) => x.classList.toggle("selected", x === b));
        rows();
      }),
  );
  $("#download").onclick = download;
  $("#print").onclick = () => {
    document
      .querySelectorAll("#ingredient-rows details")
      .forEach((d) => (d.open = true));
    window.print();
  };
  $("#save").onclick = async () => {
    const b = $("#save");
    b.disabled = true;
    message("#save-status", "Saving…");
    try {
      const d = await api("save", submitted);
      message("#save-status", d.message + " Code: " + d.token);
      $("#report-token").value = d.token;
    } catch (e) {
      message("#save-status", e.message);
    } finally {
      b.disabled = false;
    }
  };
  $("#explain").onclick = async () => {
    const b = $("#explain");
    b.disabled = true;
    message("#ai-status", "Preparing explanation…");
    try {
      const d = await api("explain", {
        ...submitted,
        accessCode: $("#access-code").value,
      });
      message("#ai-status", d.text + (d.cached ? " (Cached explanation)" : ""));
    } catch (e) {
      message("#ai-status", e.message);
    } finally {
      b.disabled = false;
    }
  };
}
$("#label-form").onsubmit = (e) => {
  e.preventDefault();
  try {
    submitted = {
      text: $("#ingredients").value,
      productType: $("#product-type").value,
      name: $("#product-name").value,
    };
    current = analyze(submitted.text, submitted.productType);
    renderReport();
    message("#input-status", "Analysis complete.");
  } catch (err) {
    message("#input-status", err.message);
  }
};
$("#ingredients").oninput = () =>
  message(
    "#char-count",
    `${$("#ingredients").value.length.toLocaleString()} / 12,000`,
  );
$("#sample").onclick = () => {
  $("#ingredients").value =
    "Aqua, Glycerin, Niacinamide, Panthenol, Cetearyl Alcohol, Parfum, Linalool, Phenoxyethanol";
  $("#product-name").value = "Example daily moisturizer";
  $("#ingredients").dispatchEvent(new Event("input"));
  $("#label-form").requestSubmit();
};
$("#text-tab").onclick = () => $("#ingredients").focus();
$("#photo").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 8 * 1024 * 1024
  ) {
    message("#input-status", "Choose a PNG, JPEG or WebP under 8 MB.");
    return;
  }
  let worker;
  try {
    message(
      "#input-status",
      "Loading the label reader. First use downloads OCR language data…",
    );
    const { createWorker } = await import("tesseract.js");
    worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text")
          message(
            "#input-status",
            `Reading label: ${Math.round(m.progress * 100)}%`,
          );
      },
    });
    const { data } = await worker.recognize(file);
    $("#ingredients").value = data.text.slice(0, 12000);
    $("#ingredients").dispatchEvent(new Event("input"));
    message(
      "#input-status",
      "Text extracted. Review and correct the ingredient list, then select Analyze.",
    );
  } catch {
    message(
      "#input-status",
      "Photo reading could not finish. Try a clearer image or paste the label text.",
    );
  } finally {
    if (worker) await worker.terminate();
    e.target.value = "";
  }
};
function library() {
  const q = $("#search").value.toLowerCase();
  const matches = INGREDIENTS.filter((i) =>
    [i.name, ...i.aliases].some((n) => n.toLowerCase().includes(q)),
  );
  $("#library-results").innerHTML =
    matches
      .slice(0, 8)
      .map(
        (i) =>
          `<div class="library-item"><div><strong>${esc(i.name)}</strong><small>${esc(i.role)}</small></div><a href="${SOURCES[i.source].url}" target="_blank" rel="noreferrer">Reference ↗</a></div>`,
      )
      .join("") || "<p>No match in this starter dataset.</p>";
}
$("#search").oninput = library;
library();
$("#retrieve-form").onsubmit = async (e) => {
  e.preventDefault();
  message("#cloud-status", "Retrieving…");
  try {
    current = await api("report", { token: $("#report-token").value.trim() });
    submitted = null;
    renderReport();
    message("#cloud-status", "Report retrieved.");
    $("#result-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    message("#cloud-status", err.message);
  }
};
$("#delete-report").onclick = async () => {
  if (!$("#report-token").checkValidity()) {
    message("#cloud-status", "Enter a valid retrieval code.");
    return;
  }
  if (!confirm("Permanently delete this saved report?")) return;
  try {
    await api("report", {
      token: $("#report-token").value.trim(),
      action: "delete",
    });
    message("#cloud-status", "Cloud report deleted.");
    $("#report-token").value = "";
  } catch (e) {
    message("#cloud-status", e.message);
  }
};
fetch("/api/status")
  .then((r) => (r.ok ? r.json() : {}))
  .then((d) => {
    status = d;
  })
  .catch(() => {});
