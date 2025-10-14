/********************************************************************
 * FRONT-END JS (FULL ORIGINAL — CSV-BASED, CLEANED, FIXED)
 ********************************************************************/

// ============================
// WELLNESS PLAN DYNAMIC JS (CSV-BASED, CLEANED, FIXED)
// ============================

const root = getComputedStyle(document.documentElement);

// ✅ Helper for CSS vars
function cssVar(name) {
  return root.getPropertyValue(name).trim();
}

// --- Provider-specific secure endpoints ---
const API_URL = "https://script.google.com/macros/s/AKfycbxueaXSY53pn5iEEXyUR1-xxJwTl9txRIGj7_ua8o_NCJDBVVT0Ap25y2zxaewje7xV/exec";

const PROVIDERS = {
  pj: { wellness: API_URL },
  pb: { wellness: API_URL }
};

const TABS = {
  meds:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1442071508&single=true&output=csv",
  lifestyle:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1970185497&single=true&output=csv",
  bodycomp:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1795189157&single=true&output=csv",
  toconsider: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1041049772&single=true&output=csv"
};

// ============================
// CSV FETCH + PARSER
// ============================

// Safer line parser that handles quoted cells with commas
function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"'; // escaped quote
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current);   // 🚫 no trim here
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);       // 🚫 no trim here

  return cells;
}

function normalizeHeader(h) {
  return (h || "").replace(/^\uFEFF/, "").trim();
}

// ========================================
// SECURE FETCH (for /pj/274 or /pb/274 structure)
// ========================================
async function fetchPatientRows() {
  const API_URL = "https://script.google.com/macros/s/AKfycbxueaXSY53pn5iEEXyUR1-xxJwTl9txRIGj7_ua8o_NCJDBVVT0Ap25y2zxaewje7xV/exec";

  // Extract provider + patient ID from URL
  const parts = window.location.pathname.split("/").filter(Boolean);
  const provider = parts[0];
  const patientId = parts[parts.length - 1];

  if (!provider || !patientId) {
    throw new Error("❌ Missing provider or patient ID in URL path");
  }

  // Build secure request (no token needed)
  const urlWithParams = `${API_URL}?provider=${provider}&id=${patientId}`;
  console.log("🔍 Fetching patient data:", urlWithParams);

  const response = await fetch(urlWithParams, { cache: "no-store" });
  if (!response.ok) throw new Error(`❌ Failed to load patient data (${response.status})`);

  const data = await response.json();
  console.log(`✅ Loaded ${data.length} rows for ${provider.toUpperCase()} patient ${patientId}`);
  return data;
}

// ========================================
// FETCH PUBLIC LIBRARY CSVs
// ========================================
async function fetchLibraryCsv(url) {
  const text = await (await fetch(url, { cache: "no-store" })).text();
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
    return obj;
  });
}

// ============================
// Apply CSS TEXT Vars
// ============================
function setTextIfAvailable(selector, cssVarName, fallback) {
  const el = document.querySelector(selector);
  if (el) {
    el.innerHTML = normalizeCellText(cssVar(cssVarName) || fallback);
  }
}

function injectResourceLinksAndTitles() {
  console.log("🔗 Injecting resource links & titles");

  // Resource links
  [
    ["dynamicFullscriptLink", "--fullscript-url", "fullscriptText", "--fullscript-text", "fullscriptNote", "--fullscript-note"],
    ["dynamicAddOnsLink", "--treatment-addons-url", "addonsText", "--addons-text", "addonsNote", "--addons-note"],
    ["dynamicStandardsLink", "--basic-standards-url", "standardsText", "--standards-text", "standardsNote", "--standards-note"],
    ["dynamicCoachingLink", "--health-coaching-url", "dynamicCoachingLink", "--coaching-text", "coachingNote", "--coaching-note"],
    ["dynamicFollowUpLink", "--followup-url", "followupText", "--followup-text", null, null],
  ].forEach(([aId, hrefVar, textId, textVar, noteId, noteVar]) => {
    const link = document.getElementById(aId);
    const textEl = document.getElementById(textId);
    const noteEl = noteId ? document.getElementById(noteId) : null;

    const href = cssVar(hrefVar);
    const text = cssVar(textVar);
    const note = noteVar ? cssVar(noteVar) : "";

    if (link && href) link.href = href;
    if (textEl && text) textEl.innerHTML = normalizeCellText(text);
    if (noteEl && note) noteEl.innerHTML = normalizeCellText(note);
  });

  // Titles & intro
  setTextIfAvailable(".title-plan", "--title-plan", "Wellness Plan");
  setTextIfAvailable(".title-summary", "--title-summary", "Summary");
  setTextIfAvailable(".title-lifestyle", "--title-lifestyle", "Lifestyle & Health Optimization Protocol");
  setTextIfAvailable(".lifestyle-subtext", "--lifestyle-subtext", "");
  setTextIfAvailable(".title-goals", "--title-goals", "Goals & Follow-Up");

  const intro = document.querySelector(".intro-text");
  if (intro) intro.innerHTML = normalizeCellText(cssVar("--intro-message"));

  ["dynamicTopBtn1", "dynamicTopBtn2"].forEach((id, i) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.textContent = cssVar(`--top-btn${i+1}-text`);
      btn.href = cssVar(`--top-btn${i+1}-url`);
    }
  });
}

// ============================
// Remove target="_blank"
// ============================
document.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute("target"));

// ============================
// Info Icon + Name Toggles (Meds + Lifestyle)
// ============================
document.addEventListener("click", e => {
  // --- Medications ---
  const medNameEl = e.target.closest(".med-name");
  if (medNameEl) {
    const row = medNameEl.closest(".med-row");
    const content = row?.querySelector(".learn-more-content");
    if (content) {
      document.querySelectorAll(".learn-more-content.expanded").forEach(openContent => {
        if (openContent !== content) openContent.classList.remove("expanded");
      });
      content.classList.toggle("expanded");
    }
    return;
  }

  // --- Lifestyle ---
  const tipNameEl = e.target.closest(".tip-name");
  if (tipNameEl) {
    const row = tipNameEl.closest(".lifestyle-row");
    const content = row?.querySelector(".lifestyle-learn-more");
    if (content) {
      document.querySelectorAll(".lifestyle-learn-more.expanded").forEach(openContent => {
        if (openContent !== content) openContent.classList.remove("expanded");
      });
      content.classList.toggle("expanded");
    }
  }
});

// ============================
// Helpers
// ============================
function normalizeCellText(text) {
  if (!text) return "";
  return text
    .trim() // safe to trim here now
    .replace(/\\n/g, "<br>")        // literal \n
    .replace(/(\r\n|\r|\n)/g, "<br>") 
    .replace(/&lt;br&gt;/g, "<br>");
}

// Normalize header names (strip hidden chars, unify variations)
function getIdField(row) {
  return (
    row["Patient ID"] ||
    row["﻿Patient ID"] ||
    row["ID"] ||
    ""
  );
}

// --- Flexible field getter ---
function getField(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") {
      return row[key];
    }
  }
  return "";
}

// --- Inject Patient Data ---
function injectPatientData(rows, lifestyleData, medsData, bodyCompData, toConsiderData) {
  if (!rows || rows.length === 0) {
    console.warn("⚠️ injectPatientData called with no rows");
    return;
  }

  console.group("🧾 InjectPatientData Debug");
  console.log("Full patient rows:", rows);

  const patientMeta = rows[0];
  console.log("Using patientMeta for meta fields:", patientMeta);

  // --- Collect meds/supps ---
  const medsByCategory = { 
    Daily:   { meds: [], supps: [] }, 
    Evening: { meds: [], supps: [] }, 
    Weekly:  { meds: [], supps: [] }, 
    PRN:     { meds: [], supps: [] } 
  };

  rows.forEach((r, idx) => {
    const med = getField(r, ["Meds/Supp", "Medication", "Med"]);
    if (!med) return;

    // --- Dose with Note styling ---
    let dose = getField(r, ["Dose", "Dosing"]) || "";
    let doseHtml = dose;

    if (dose.includes("Note:")) {
      const [mainDose, ...noteParts] = dose.split(/Note:/);
      const main = mainDose.trim();
      const note = noteParts.join("Note:").trim();

      doseHtml = `
        ${main ? main + "<br>" : ""}
        <span class="dose-note">Note: ${note}</span>
      `;
    }

    const cat = (getField(r, ["Category", "Cat"]) || "").trim();

    let blurb = "";
    const medInfo = medsData.find(m => (m["Medication"] || "").trim() === med.trim());
    if (medInfo) blurb = medInfo["Blurb"] || "";

    // --- Build med name ---
    const medNameHtml = `<strong>${med}</strong>`;

    const medHtml = `
      <li class="med-row">
        <div class="med-name">${medNameHtml}${blurb ? `<span class="info-icon">i</span>` : ""}</div>
        <div class="dose">${doseHtml}</div>
        ${blurb ? `<div class="learn-more-content">${normalizeCellText(blurb)}</div>` : ""}
      </li>
    `;

    // --- Push into right bucket ---
    if (cat.includes("Supplement")) {
      if (cat.startsWith("Daily")) medsByCategory.Daily.supps.push(medHtml);
      else if (cat.startsWith("Evening")) medsByCategory.Evening.supps.push(medHtml);
      else if (cat.startsWith("Weekly")) medsByCategory.Weekly.supps.push(medHtml);
      else if (cat.startsWith("PRN")) medsByCategory.PRN.supps.push(medHtml);
    } else if (medsByCategory[cat]) {
      medsByCategory[cat].meds.push(medHtml);
    }
  });

  // --- Render meds into DOM ---
  Object.entries(medsByCategory).forEach(([cat, { meds, supps }]) => {
    const listId  = { Daily:"dailyMeds", Evening:"eveningMeds", Weekly:"weeklyMeds", PRN:"prnMeds" }[cat];
    const blockId = { Daily:"dailyBlock", Evening:"eveningBlock", Weekly:"weeklyBlock", PRN:"prnBlock" }[cat];
    const block   = document.getElementById(blockId);
    const list    = document.getElementById(listId);
    if (!list || !block) return;

    if (meds.length > 0 || supps.length > 0) {
      let html = meds.join("");
      if (supps.length > 0) {
        html += `<li class="med-subtitle"><span>SUPPLEMENTS</span></li>${supps.join("")}`;
      }
      list.innerHTML = html;
    } else {
      block.remove();
    }
  });

  // --- Hybrid Parser Helper ---
  function parseHybridValues(rows, fieldNames, knownOptions = []) {
    const rawValues = rows.map(r => getField(r, fieldNames)).filter(Boolean);
    const values = [];

    rawValues.forEach((val, idx) => {
      if (!val) return;

      console.group(`🔎 parseHybridValues: Row ${idx + 2}`);
      console.log("Raw value:", JSON.stringify(val));

      // If custom HTML, keep whole
      if (val.includes("<") || val.includes(">")) {
        console.log("📌 Detected HTML → keeping as-is");
        values.push(val.trim());
        console.groupEnd();
        return;
      }

      const cleanVal = val.trim();

      // Try splitting by comma
      const parts = cleanVal.split(",").map(v => v.trim()).filter(Boolean);
      const allKnown = parts.length > 1 && parts.every(p => knownOptions.includes(p));

      if (allKnown) {
        console.log("✅ All parts are KNOWN dropdown items:", parts);
        values.push(...parts);
      } else {
        console.log("↩️ Treating as free-text → splitting only on returns");
        cleanVal.split(/\r\n|\r|\n/).forEach(v => {
          const t = v.trim();
          if (t) {
            console.log("  ➡️ Added:", t);
            values.push(t);
          }
        });
      }
      console.groupEnd();
    });

    console.log("🎯 Final parsed values:", values);
    return values;
  }

  // --- To Consider (supports library headers "To Consider Medication" OR "Medication") ---
  const toConsiderList = document.getElementById("toConsider");
  const toConsiderBlock = document.getElementById("toConsiderBlock");

  if (toConsiderList && toConsiderBlock) {
    // Flexible getter for the library row's name field
    const getTCName = r => (r["To Consider Medication"] || r["Medication"] || "").trim();

    // Known options from the library (for chip/free-text parsing)
    const toConsiderKnown = toConsiderData.map(getTCName).filter(Boolean);

    // Read selections from the patient's rows (chips or free text)
    const meds = parseHybridValues(rows, ["To Consider", "Consider"], toConsiderKnown);

    if (meds.length > 0) {
      // Case-insensitive find against the library
      const findInfo = (name) => {
        const target = String(name).trim().toLowerCase();
        return toConsiderData.find(r => getTCName(r).toLowerCase() === target) || null;
      };

      const CATEGORY_ORDER = ["Hormones", "Peptides", "Medications", "Micronutrients", "Other"];
      const grouped = {};

      meds.forEach(med => {
        const info = findInfo(med);

        if (info) {
          const category = (info["Category"] || "").trim() || "Other";
          (grouped[category] ||= []).push({
            name: getTCName(info),
            blurb: info["Blurb"] || ""
          });
        } else {
          // Free text → split "Name: blurb" or "Name - blurb" if present
          let name = String(med).trim();
          let blurb = "";
          const m = name.match(/^([^:-]+)[:\-](.+)$/);
          if (m) { name = m[1].trim(); blurb = m[2].trim(); }
          (grouped["Other"] ||= []).push({ name, blurb });
        }
      });

      const orderedCats = [
        ...CATEGORY_ORDER.filter(cat => grouped[cat]),
        ...Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat)),
      ];

      toConsiderList.innerHTML = orderedCats.map(cat => {
        const items = grouped[cat].map(item => `
          <li class="to-consider-row">
            <div class="to-consider-name"><strong>${item.name}</strong></div>
            <div class="to-consider-blurb">${normalizeCellText(item.blurb)}</div>
          </li>
        `).join("");

        return `<li class="to-consider-subtitle">${cat}</li>${items}`;
      }).join("");

      toConsiderBlock.style.display = "block";
    } else {
      toConsiderBlock.style.display = "none";
    }
  }

  // --- Lifestyle Tips ---
  const lifestyleBlock = document.getElementById("lifestyleTips");
  if (lifestyleBlock) {
    const lifestyleTipsKnown = lifestyleData.map(r => (r["Tip"] || "").trim());
    const tips = parseHybridValues(rows, ["Lifestyle Tips","Lifestyle/Type"], lifestyleTipsKnown);

    console.log("Lifestyle tips (all rows):", tips);
    if (tips.length > 0) {
      let html = "";
      tips.forEach(tipName => {
        const tipInfo = lifestyleData.find(r => (r["Tip"] || "").trim() === tipName.trim());

        if (tipInfo) {
          // ✅ Known tip from library
          html += `
            <li class="lifestyle-row">
              <div class="tip-name">
                <strong>${tipInfo["Tip"]}</strong>
                ${tipInfo["Blurb"] ? `<span class="info-icon">i</span>` : ""}
              </div>
              ${tipInfo["Blurb"] ? `<div class="lifestyle-learn-more">${normalizeCellText(tipInfo["Blurb"])}</div>` : ""}
            </li>`;
        } else {
          // ✅ Custom free-text tip (split on colon)
          let raw = String(tipName).trim();
          let title = raw;
          let blurb = "";

          const colonIndex = raw.indexOf(":");
          if (colonIndex !== -1) {
            title = raw.slice(0, colonIndex).trim();
            blurb = raw.slice(colonIndex + 1).trim();
          }

          html += `
            <li class="lifestyle-row">
              <div class="tip-name">
                <strong>${normalizeCellText(title)}</strong>
                ${blurb ? `<span class="info-icon">i</span>` : ""}
              </div>
              ${blurb ? `<div class="lifestyle-learn-more">${normalizeCellText(blurb)}</div>` : ""}
            </li>`;
        }
      }); // ✅ end forEach

      lifestyleBlock.innerHTML = html;
    }
  } // ✅ end if(lifestyleBlock)

  // --- Visit Timeline (row 1 only) ---
  const visitTimelineList = document.getElementById("visitTimeline");
  const visitTimelineTitle = document.getElementById("visitTimelineTitle");
  if (visitTimelineList && visitTimelineTitle) {
    visitTimelineTitle.textContent = cssVar("--visit-timeline-title") || "Visit Timeline";

    const prev = normalizeCellText(getField(rows[0], ["Previous Visit","Prev Visit","﻿Previous Visit"]) || "");
    const next = normalizeCellText(getField(rows[0], ["Next Visit","Follow-Up","﻿Next Visit"]) || "");

    if (prev || next) {
      let html = "";
      if (prev) html += `<li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${prev}</span></li>`;
      if (next) html += `<li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${next}</span></li>`;
      visitTimelineList.innerHTML = html;
    } else {
      visitTimelineTitle.remove();
      visitTimelineList.remove();
    }
  }

  // --- Body Comp ---
  const bodyCompList = document.getElementById("bodyComp");
  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompList && bodyCompTitle) {
    bodyCompTitle.textContent = cssVar("--bodycomp-title") || "Body Composition";

    const bodyCompKnown = bodyCompData.map(r => (r["State"] || "").trim());
    const keys = parseHybridValues(rows, ["Body Comp","Body Composition"], bodyCompKnown);

    if (keys.length > 0) {
      let html = "";
      keys.forEach(key => {
        const compRow = bodyCompData.find(b => (b["State"] || "").trim() === key.trim());

        if (compRow && compRow["Blurb"]) {
          html += `<li><span class="editable">${normalizeCellText(compRow["Blurb"])}</span></li>`;
        } else {
          html += `<li><span class="editable">${normalizeCellText(key)}</span></li>`;
        }
      });
      bodyCompList.innerHTML = html;
    } else {
      bodyCompTitle.remove();
      bodyCompList.remove();
    }
  }

  // --- Target Goals ---
  const targetGoalsList = document.getElementById("targetGoals");
  const targetTitle = document.getElementById("targetTitle");
  if (targetGoalsList && targetTitle) {
    targetTitle.textContent = cssVar("--target-title") || "Target Goals";

    const goalKnown = []; // no fixed library? leave empty
    const allGoals = parseHybridValues(rows, ["Target Goals","Goals"], goalKnown);

    if (allGoals.length > 0) {
      let html = "";
      allGoals.forEach(g => {
        html += `<li><span class="editable">${normalizeCellText(g)}</span></li>`;
      });
      targetGoalsList.innerHTML = html;
    } else {
      targetTitle.remove();
      targetGoalsList.remove();
    }
  }

  // --- Other (free text with parsing for colon/dash) ---
  const otherList = document.getElementById("otherItems");
  const otherTitle = document.getElementById("otherTitle");

  if (otherList && otherTitle) {
    otherTitle.textContent = cssVar("--other-title") || "Other";

    const rawOthers = parseHybridValues(rows, ["Other"], []);
    if (rawOthers.length > 0) {
      let html = "";
      rawOthers.forEach(item => {
        let name = item.trim();
        let blurb = "";

        // Split on first colon OR dash
        if (name.includes(":") || name.includes("-")) {
          const parts = name.split(/[:\-]/);
          name = parts.shift().trim();
          blurb = parts.join(":").trim();
        }

        html += `<li class="other-row"><span class="editable"><strong>${name}</strong>${blurb ? ": " + normalizeCellText(blurb) : ""}</span></li>`;
      });

      otherList.innerHTML = html;
      otherTitle.style.display = "block";
    } else {
      otherTitle.remove();
      otherList.remove();
    }
  }

  console.groupEnd();
}

// ============================
// Find contiguous block of rows for a patient ID (with detailed logging)
// ============================
function getPatientBlock(rows, patientId) {
  const result = [];
  let insideBlock = false;

  console.log(`🔎 getPatientBlock: Looking for Patient ID=${patientId}`);
  console.log(`📊 Total rows provided: ${rows.length}`);

  rows.forEach((r, idx) => {
    // normalize row: sometimes it's an array of cells, sometimes a single value
    const cells = Array.isArray(r) ? r : [r];
    const id = (getIdField(r) || "").trim().replace(/\.0$/, "");

    console.log(`---`);
    console.log(`Row ${idx + 2}: raw=`, r);
    console.log(`Row ${idx + 2}: normalized cells=`, JSON.stringify(cells));
    console.log(`Row ${idx + 2}: extracted ID="${id}" (target=${patientId})`);

    if (id === patientId) {
      console.log(`✅ Row ${idx + 2}: START block for ${patientId}`);
      insideBlock = true;
      result.push(r);

    } else if (insideBlock && !id) {
      // row has no ID → check if it has other data
      const hasData = cells.some((cell, ci) => ci > 1 && String(cell || "").trim() !== "");
      console.log(
        `Row ${idx + 2}: insideBlock=true, blank ID, hasData=${hasData}, cells=${JSON.stringify(cells)}`
      );

      if (hasData) {
        console.log(`➡️ Row ${idx + 2}: continuing block (blank ID but has data)`);
        result.push(r);
      } else {
        console.log(`⚪ Row ${idx + 2}: blank ID AND no data → skipping`);
      }

    } else if (insideBlock && id && id !== patientId) {
      console.log(`⛔ Row ${idx + 2}: hit new patient (${id}), stopping`);
      insideBlock = false;
    } else {
      console.log(`ℹ️ Row ${idx + 2}: not relevant (id="${id}", insideBlock=${insideBlock})`);
    }
  });

  console.log(`========================================`);
  console.log(`🏁 getPatientBlock finished: Found ${result.length} rows for Patient ID=${patientId}`);
  console.log(`Final block=`, JSON.stringify(result, null, 2));
  console.log(`========================================`);

  return result;
}

// ============================
// Load Patient Data
// ============================
function getProviderAndPatientIdFromUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const providerCode = parts[0];
  const patientId = parts.pop();
  return { providerCode, patientId };
}

async function loadPatientData() {
  const start = performance.now();
  try {
    const { providerCode, patientId } = getProviderAndPatientIdFromUrl();
    const provider = PROVIDERS[providerCode];
    if (!provider) return console.error("❌ Unknown provider:", providerCode);

    console.log(`📋 Loading data for provider=${providerCode}, patientId=${patientId}`);

    const [
      patientRows,
      medsData,
      lifestyleData,
      bodyCompData,
      toConsiderData
    ] = await Promise.all([
      fetchPatientRows(), // ✅ Secure JSON for current patient
      fetchLibraryCsv(TABS.meds),
      fetchLibraryCsv(TABS.lifestyle),
      fetchLibraryCsv(TABS.bodycomp),
      fetchLibraryCsv(TABS.toconsider),
    ]);

    if (patientRows && patientRows.length > 0) {
      injectPatientData(patientRows, lifestyleData, medsData, bodyCompData, toConsiderData);
      injectResourceLinksAndTitles();
    } else {
      console.warn(`⚠️ No rows found for Patient ID=${patientId}`);
    }

    console.log(`✅ Total load time: ${(performance.now() - start).toFixed(2)} ms`);
  } catch (err) {
    console.error("❌ Error in loadPatientData:", err);
  }
}

// ============================
// Bootstrap with retry
// ============================
function bootstrapWellnessPlanSafe(attempt = 1) {
  try {
    console.log(`🚀 bootstrapWellnessPlanSafe attempt ${attempt}`);
    loadPatientData();

    // Check for key DOM blocks that should exist
    const requiredEls = [
      document.getElementById("toConsiderBlock"),
      document.getElementById("dynamicFullscriptLink"),
      document.getElementById("dynamicAddOnsLink"),
      document.getElementById("dynamicStandardsLink"),
      document.getElementById("dynamicCoachingLink"),
      document.getElementById("dynamicFollowUpLink"),
    ];

    const missing = requiredEls.filter(el => !el);
    if (missing.length > 0 && attempt < 3) {
      console.warn(`⚠️ Missing ${missing.length} critical elements. Retrying in 200ms...`);
      setTimeout(() => bootstrapWellnessPlanSafe(attempt + 1), 200);
    } else if (missing.length === 0) {
      console.log("✅ All critical blocks loaded on attempt", attempt);
    } else {
      console.warn("❌ Some elements never appeared:", missing);
    }
  } catch (err) {
    console.error("❌ bootstrapWellnessPlanSafe failed:", err);
  }
}

// Ensure DOM is ready before firing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => bootstrapWellnessPlanSafe());
} else {
  bootstrapWellnessPlanSafe();
}
