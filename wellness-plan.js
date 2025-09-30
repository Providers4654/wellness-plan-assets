// ============================
// WELLNESS PLAN DYNAMIC JS (CSV-BASED, CLEANED, FIXED)
// ============================

const root = getComputedStyle(document.documentElement);

// ✅ Helper for CSS vars
function cssVar(name) {
  return root.getPropertyValue(name).trim();
}

// --- Provider-specific public CSVs ---
const PROVIDERS = {
  pj: {
    wellness: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=0&single=true&output=csv"
  },
  pb: {
    wellness: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRV9VSxPY8Sy_v7mq_dDOYTRSIr0aWqbj7FH9ATxJJs8IsqTeZkmSTJcv7MyIjrI_fzmRY7qdZjEJZb/pub?gid=0&single=true&output=csv"
  }
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
  const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
  const matches = [];
  line.replace(regex, (m) => {
    matches.push(m.replace(/^"|"$/g, "")); // strip wrapping quotes
  });
  return matches;
}

async function fetchCsv(url) {
  const text = await fetch(url).then(r => r.text());
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = parseCsvLine(headerLine);
  return lines.map(line => {
    const cells = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] || ""));
    return obj;
  });
}






// ============================
// RESOURCE LINKS
// ============================
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
  if (textEl && text) textEl.textContent = text;
  if (noteEl && note) noteEl.textContent = note;
});

// ============================
// Apply CSS TEXT Vars
// ============================
function setTextIfAvailable(selector, cssVarName, fallback) {
  const el = document.querySelector(selector);
  if (el) el.textContent = cssVar(cssVarName) || fallback;
}

setTextIfAvailable(".title-plan", "--title-plan", "Wellness Plan");
setTextIfAvailable(".title-summary", "--title-summary", "Summary");
setTextIfAvailable(".title-lifestyle", "--title-lifestyle", "Lifestyle & Health Habits");
setTextIfAvailable(".title-goals", "--title-goals", "Goals & Follow-Up");

const intro = document.querySelector(".intro-text");
if (intro) intro.textContent = cssVar("--intro-message");

["dynamicTopBtn1", "dynamicTopBtn2"].forEach((id, i) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.textContent = cssVar(`--top-btn${i+1}-text`);
    btn.href = cssVar(`--top-btn${i+1}-url`);
  }
});

// ============================
// Remove target="_blank"
// ============================
document.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute("target"));

// ============================
// Info Icon + Name Toggles
// ============================
document.addEventListener("click", e => {
  const medNameEl = e.target.closest(".med-name"); 
  if (!medNameEl) return;
  const row = medNameEl.closest(".med-row");
  const content = row?.querySelector(".learn-more-content");
  if (!content) return;

  document.querySelectorAll(".learn-more-content.expanded").forEach(openContent => {
    if (openContent !== content) openContent.classList.remove("expanded");
  });

  content.classList.toggle("expanded");
});

// ============================
// Helpers
// ============================
function normalizeCellText(text) {
  if (!text) return "";
  return text.replace(/(\r\n|\r|\n)/g, "<br>").replace(/&lt;br&gt;/g, "<br>");
}



// ============================
// Inject Patient Data
// ============================
function injectPatientData(rows, lifestyleData, medsData, bodyCompData, toConsiderData) {
  // Section titles
  const visitTitle = document.getElementById("visitTimelineTitle");
  if (visitTitle) visitTitle.textContent = cssVar("--visit-timeline-title");

  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompTitle) bodyCompTitle.textContent = cssVar("--bodycomp-title");

  const targetTitle = document.getElementById("targetTitle");
  if (targetTitle) targetTitle.textContent = cssVar("--target-title");

  // Group meds (Daily/Evening/Weekly/PRN)
  const medsByCategory = {
    Daily: { meds: [], supps: [] },
    Evening: { meds: [], supps: [] },
    Weekly: { meds: [], supps: [] },
    PRN: { meds: [], supps: [] }
  };

  rows.forEach(r => {
    const med = r["Meds/Supp"];
    if (!med) return;

    const dose = r["Dose"] || "";
    const cat = (r["Category"] || "").trim();

    let blurb = "";
    const medInfo = medsData.find(m => m["Medication"] === med);
    if (medInfo) blurb = medInfo["Blurb"] || "";

    const medHtml = `
      <li class="med-row">
        <div class="med-name">
          <strong>${med}</strong>
          ${blurb ? `<span class="info-icon" title="More info">i</span>` : ""}
        </div>
        <div class="dose">${dose}</div>
        ${blurb ? `<div class="learn-more-content">${normalizeCellText(blurb)}</div>` : ""}
      </li>
    `;

    if (cat.includes("Supplement")) {
      if (cat.startsWith("Daily")) medsByCategory.Daily.supps.push(medHtml);
      else if (cat.startsWith("Evening")) medsByCategory.Evening.supps.push(medHtml);
      else if (cat.startsWith("Weekly")) medsByCategory.Weekly.supps.push(medHtml);
      else if (cat.startsWith("PRN")) medsByCategory.PRN.supps.push(medHtml);
    } else if (medsByCategory[cat]) {
      medsByCategory[cat].meds.push(medHtml);
    }
  });

  // Inject meds into DOM
  Object.entries(medsByCategory).forEach(([cat, { meds, supps }]) => {
    const listId = { Daily: "dailyMeds", Evening: "eveningMeds", Weekly: "weeklyMeds", PRN: "prnMeds" }[cat];
    const blockId = { Daily: "dailyBlock", Evening: "eveningBlock", Weekly: "weeklyBlock", PRN: "prnBlock" }[cat];
    const block = document.getElementById(blockId);
    const list = document.getElementById(listId);
    if (!list || !block) return;

    if (meds.length > 0 || supps.length > 0) {
      let html = meds.join("");
      if (supps.length > 0) html += `<li class="med-subtitle"><span>SUPPLEMENTS</span></li>${supps.join("")}`;
      list.innerHTML = html;
    } else {
      block.remove();
    }
  });

  // --- To Consider ---
  const toConsiderList = document.getElementById("toConsider");
  const toConsiderBlock = document.getElementById("toConsiderBlock");

  if (toConsiderList && toConsiderBlock) {
    const firstRow = rows[0];
    const meds = (firstRow["To Consider"] || "")
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (meds.length > 0) {
      let html = "";
      const CATEGORY_ORDER = ["Hormones", "Peptides", "Medications"];
      const grouped = {};
      meds.forEach(med => {
        const info = toConsiderData.find(r => r["Medication"].trim() === med);
        if (!info) return;
        const category = (info["Category"] || "").trim() || "Other";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(info);
      });

      CATEGORY_ORDER.forEach(category => {
        if (grouped[category]) {
          html += `<li class="to-consider-subtitle">${category}</li>`;
          grouped[category].forEach(info => {
            const blurb = info["Blurb"] || "";
            html += `
              <li class="to-consider-row">
                <div class="to-consider-name">${info["Medication"]}</div>
                <div class="to-consider-blurb">${blurb}</div>
              </li>
            `;
          });
        }
      });

      Object.keys(grouped).forEach(category => {
        if (!CATEGORY_ORDER.includes(category)) {
          html += `<li class="to-consider-subtitle">${category}</li>`;
          grouped[category].forEach(info => {
            const blurb = info["Blurb"] || "";
            html += `
              <li class="to-consider-row">
                <div class="to-consider-name">${info["Medication"]}</div>
                <div class="to-consider-blurb">${blurb}</div>
              </li>
            `;
          });
        }
      });

      toConsiderList.innerHTML = html;
      toConsiderBlock.style.display = "block";
    } else {
      toConsiderBlock.style.display = "none";
    }
  }

  // Visit timeline
  const visitTimelineList = document.getElementById("visitTimeline");
  if (visitTimelineList) {
    const firstRow = rows[0];
    const prev = firstRow["Previous Visit"] || "";
    const next = firstRow["Next Visit"] || "";

    if (prev || next) {
      visitTimelineList.innerHTML = `
        ${prev ? `<li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${prev}</span></li>` : ""}
        ${next ? `<li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${next}</span></li>` : ""}
      `;
    } else {
      const vtTitle = document.getElementById("visitTimelineTitle");
      if (vtTitle) vtTitle.remove();
      visitTimelineList.remove();
    }
  }

  // Lifestyle tips
  const lifestyleBlock = document.getElementById("lifestyleTips");
  if (lifestyleBlock) {
    const firstRow = rows[0];
    const selectedTips = (firstRow["Lifestyle Tips"] || "").split(",").map(t => t.trim()).filter(Boolean);
    if (selectedTips.length > 0) {
      let html = '<ul class="lifestyle-tips-list">';
      selectedTips.forEach(tipName => {
        const tipInfo = lifestyleData.find(r => r["Tip"].trim() === tipName);
        if (tipInfo) {
          html += `<li><span class="editable"><strong>${tipInfo["Tip"]}:</strong><br>${normalizeCellText(tipInfo["Blurb"])}</span></li>`;
        }
      });
      html += "</ul>";
      lifestyleBlock.innerHTML = html;
    } else {
      lifestyleBlock.innerHTML = "";
    }
  }

  // Body Comp
  const bodyCompList = document.getElementById("bodyComp");
  if (bodyCompList && bodyCompTitle) {
    const firstRow = rows[0];
    const key = (firstRow["Body Comp"] || "").trim();

    if (key) {
      const compRow = bodyCompData.find(b => (b["State"] || "").trim() === key);
      let html = "";
      if (compRow && compRow["Blurb"]) {
        html = `<li><span class="editable">${normalizeCellText(compRow["Blurb"])}</span></li>`;
      } else {
        html = `<li><span class="editable">${normalizeCellText(key)}</span></li>`;
      }
      bodyCompList.innerHTML = html;
    } else {
      if (bodyCompTitle) bodyCompTitle.remove();
      bodyCompList.remove();
    }
  }

  // Target goals
  const targetGoalsList = document.getElementById("targetGoals");
  if (targetGoalsList && targetTitle) {
    if (rows[0]["Target Goals"]) {
      targetGoalsList.innerHTML = `<li><span class="editable">${rows[0]["Target Goals"]}</span></li>`;
    } else {
      if (targetTitle) targetTitle.remove();
      targetGoalsList.remove();
    }
  }
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

    const [patientRows, medsData, lifestyleData, bodyCompData, toConsiderData] = await Promise.all([
      fetchCsv(provider.wellness),
      fetchCsv(TABS.meds),
      fetchCsv(TABS.lifestyle),
      fetchCsv(TABS.bodycomp),
      fetchCsv(TABS.toconsider),
    ]);

    // 🔎 Debug: log headers + first few IDs
    if (patientRows.length > 0) {
      console.log("Headers from CSV:", Object.keys(patientRows[0]));
      console.log("First 10 Patient IDs:", patientRows.slice(0, 10).map(r => r["Patient ID"] || r["﻿Patient ID"] || Object.values(r)[0]));
    } else {
      console.warn("⚠️ CSV returned no rows at all");
    }

    // ✅ Normalize header variations + ID formatting
    const filteredRows = patientRows.filter(r => {
      const idRaw = r["Patient ID"] || r["﻿Patient ID"] || r["Patient ID"] || "";
      const id = String(idRaw).trim().replace(/\.0$/, ""); // strip trailing .0
      return id == patientId;
    });

    if (filteredRows.length > 0) {
      injectPatientData(filteredRows, lifestyleData, medsData, bodyCompData, toConsiderData);
    } else {
      console.warn(`⚠️ No rows found for Patient ID=${patientId}`);
    }

    console.log(`✅ Total load time: ${(performance.now() - start).toFixed(2)} ms`);

  } catch (err) {
    console.error("❌ Error in loadPatientData:", err);
  }
}


// ============================
// Bootstrap
// ============================
function bootstrapWellnessPlan() {
  loadPatientData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapWellnessPlan);
} else {
  bootstrapWellnessPlan();
}
