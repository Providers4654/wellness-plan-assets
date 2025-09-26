// ============================
// WELLNESS PLAN DYNAMIC JS (FIXED)
// ============================

const root = getComputedStyle(document.documentElement);

const TABS = {
  wellness: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=0&single=true&output=csv",
  meds: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1442071508&single=true&output=csv",
  lifestyle: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1970185497&single=true&output=csv",
  bodycomp: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1795189157&single=true&output=csv"
}; 

// Helper
function cssVar(name) {
  return root.getPropertyValue(name).replace(/["']/g, "").trim();
}




// ============================
// 1. Apply CSS variable URLs to dynamic links
// ============================
[
  ["dynamicFollowUpLink", "--followup-url"],
  ["dynamicHormoneLink", "--hormone-resource-url"],
  ["dynamicAddOnsLink", "--treatment-addons-url"],
  ["dynamicStandardsLink", "--basic-standards-url"],
  ["dynamicCoachingLink", "--health-coaching-url"],
  ["dynamicTipsLink", "--lifestyle-tips-url"],
  ["dynamicFullscriptLink", "--fullscript-url"],
  ["dynamicNeedle27gLink", "--needle27g-url"],
  ["dynamicAlcoholPadsLink", "--alcohol-pads-url"],
  ["dynamicSubqVideoLink", "--subq-video-url"],
].forEach(([id, varName]) => {
  const el = document.getElementById(id);
  const url = cssVar(varName);
  if (el && url) el.href = url;
});

// ============================
// 1b. Apply CSS variable TEXT to placeholders
// ============================
const fsText = document.getElementById("fullscriptText");
if (fsText) fsText.textContent = cssVar("--fullscript-text");
const fsNote = document.getElementById("fullscriptNote");
if (fsNote) fsNote.textContent = cssVar("--fullscript-note");

const addonsText = document.getElementById("addonsText");
if (addonsText) addonsText.textContent = cssVar("--addons-text");
const addonsNote = document.getElementById("addonsNote");
if (addonsNote) addonsNote.textContent = cssVar("--addons-note");

const standardsText = document.getElementById("standardsText");
if (standardsText) standardsText.textContent = cssVar("--standards-text");
const standardsNote = document.getElementById("standardsNote");
if (standardsNote) standardsNote.textContent = cssVar("--standards-note");

const coachingLink = document.getElementById("dynamicCoachingLink");
if (coachingLink) coachingLink.textContent = cssVar("--coaching-text");
const coachingNote = document.getElementById("coachingNote");
if (coachingNote) coachingNote.textContent = cssVar("--coaching-note");

const followBtn = document.getElementById("followupText");
if (followBtn) followBtn.textContent = cssVar("--followup-text");

function setTextIfAvailable(selector, cssVarName, fallback) {
  const el = document.querySelector(selector);
  if (el) {
    const val = cssVar(cssVarName);
    el.textContent = val || fallback;
  }
}

setTextIfAvailable(".title-plan", "--title-plan", "Wellness Plan");
setTextIfAvailable(".title-summary", "--title-summary", "Summary");
setTextIfAvailable(".title-lifestyle", "--title-lifestyle", "Lifestyle & Health Habits");
setTextIfAvailable(".title-goals", "--title-goals", "Goals & Follow-Up");


const intro = document.querySelector(".intro-text");
if (intro) intro.textContent = cssVar("--intro-message");

const topBtn1 = document.getElementById("dynamicTopBtn1");
if (topBtn1) {
  topBtn1.textContent = cssVar("--top-btn1-text");
  topBtn1.href = cssVar("--top-btn1-url");
}
const topBtn2 = document.getElementById("dynamicTopBtn2");
if (topBtn2) {
  topBtn2.textContent = cssVar("--top-btn2-text");
  topBtn2.href = cssVar("--top-btn2-url");
}

// ============================
// 2. Remove all target="_blank"
// ============================
document.querySelectorAll('a[target="_blank"]').forEach((a) => {
  a.removeAttribute("target");
});

// ============================
// 3. Info Icon Toggles
// ============================
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("info-icon")) return;

  const row = e.target.closest(".med-row");
  const content = row?.querySelector(".learn-more-content");
  if (!content) return;

  document.querySelectorAll(".learn-more-content.expanded").forEach((openContent) => {
    if (openContent !== content) {
      openContent.classList.remove("expanded");
    }
  });

  content.classList.toggle("expanded");
});

// ============================
// 4. Build Section Content From Sheet (with deep debug logging)
// ============================
function injectPatientData(rows, lifestyleData, medsData, bodyCompData) {
  console.log("🔍 injectPatientData START", { rows, lifestyleData, medsData, bodyCompData });

  // --- Section Titles ---
  const visitTitle = document.getElementById("visitTimelineTitle");
  if (visitTitle) {
    visitTitle.textContent = cssVar("--visit-timeline-title");
    console.log("✅ visitTimelineTitle set");
  }

  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompTitle) {
    bodyCompTitle.textContent = cssVar("--bodycomp-title");
    console.log("✅ bodyCompTitle set");
  }

  const targetTitle = document.getElementById("targetTitle");
  if (targetTitle) {
    targetTitle.textContent = cssVar("--target-title");
    console.log("✅ targetTitle set");
  }

  // --- Group meds & supplements by category ---
  const medsByCategory = {
    Daily: { meds: [], supps: [] },
    Evening: { meds: [], supps: [] },
    Weekly: { meds: [], supps: [] },
    PRN: { meds: [], supps: [] },
    "To Consider": { meds: [], supps: [] }
  };
  console.log("📦 medsByCategory initialized", medsByCategory);

  rows.forEach((r, idx) => {
    console.log(`➡️ Processing row[${idx}]`, r);

    const med = r["Meds/Supp"];
    const dose = r["Dose"] || "";
    const cat = (r["Category"] || "").trim();

    if (!med) {
      console.log("⏭️ Skipped row (no Meds/Supp)");
      return;
    }

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
        ${blurb ? `<div class="learn-more-content">${blurb}</div>` : ""}
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

    console.log("📥 medsByCategory updated", medsByCategory);
  });

  // --- Inject Meds ---
  Object.entries(medsByCategory).forEach(([cat, { meds, supps }]) => {
    console.log(`⚙️ Injecting category: ${cat}`, { meds, supps });

    const listId = {
      Daily: "dailyMeds",
      Evening: "eveningMeds",
      Weekly: "weeklyMeds",
      PRN: "prnMeds",
      "To Consider": "toConsider",
    }[cat];

    const blockId = {
      Daily: "dailyBlock",
      Evening: "eveningBlock",
      Weekly: "weeklyBlock",
      PRN: "prnBlock",
      "To Consider": "toConsiderBlock",
    }[cat];

    const block = document.getElementById(blockId);
    const list = document.getElementById(listId);

    if (!list || !block) {
      console.warn(`⚠️ Missing DOM for ${cat}`, { listId, blockId });
      return;
    }

    if (meds.length > 0 || supps.length > 0) {
      let html = "";
      if (meds.length > 0) html += meds.join("");
      if (supps.length > 0) {
        html += `<li class="med-subtitle"><span>SUPPLEMENTS</span></li>${supps.join("")}`;
      }
      list.innerHTML = html;
      console.log(`✅ Injected ${cat} meds/supps`, html);
    } else {
      console.log(`🗑 Removing empty block for ${cat}`);
      block.remove();
    }
  });

  // --- Visit Timeline ---
  const visitTimelineList = document.getElementById("visitTimeline");
  if (visitTimelineList) {
    const firstRow = rows[0];
    visitTimelineList.innerHTML = `
      <li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${firstRow["Previous Visit"] || ""}</span></li>
      <li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${firstRow["Next Visit"] || ""}</span></li>
    `;
    console.log("✅ Visit Timeline injected", firstRow);
  }



// --- Lifestyle Tips ---
const lifestyleBlock = document.getElementById("lifestyleTips");
if (lifestyleBlock) {
  const firstRow = rows[0];
  const selectedTips = (firstRow["Lifestyle Tips"] || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (selectedTips.length > 0) {
    let html = '<ul class="lifestyle-tips-list">';
    selectedTips.forEach(tipName => {
      const tipInfo = lifestyleData.find(r => r["Tip"].trim() === tipName);
      if (tipInfo) {
        html += `
          <li>
            <span class="editable">
              <strong>${tipInfo["Tip"]}:</strong><br>
              ${tipInfo["Blurb"]}
            </span>
          </li>
        `;
      }
    });
    html += "</ul>";
    lifestyleBlock.innerHTML = html;
    console.log("✅ Injected Lifestyle Tips (editable)", selectedTips);
  } else {
    lifestyleBlock.innerHTML = "";
    console.log("ℹ️ No Lifestyle Tips selected for this patient");
  }
}




  

  // --- Helper: convert newlines into <br>
function normalizeCellText(text) {
  if (!text) return "";
  return text
    // Google Sheets sometimes uses carriage return entities
    .replace(/&#10;/g, "<br>")
    // real line breaks
    .replace(/(\r\n|\r|\n)/g, "<br>")
    // already-typed <br> (don’t double escape)
    .replace(/&lt;br&gt;/g, "<br>");
}



// --- Body Comp ---
const bodyCompList = document.getElementById("bodyComp");
if (bodyCompList) {
  const firstRow = rows[0];
  const key = (firstRow["Body Comp"] || "").trim();

  let html = "";
  const compRow = bodyCompData.find(b => (b["State"] || "").trim() === key);
  if (compRow && compRow["Blurb"]) {
    html = `
      <ul class="goals-list">
        <li>
          <span class="editable">${normalizeCellText(compRow["Blurb"])}</span>
        </li>
      </ul>
    `;
  } else if (key) {
    html = `
      <ul class="goals-list">
        <li>
          <span class="editable">${key}</span>
        </li>
      </ul>
    `;
  }

  bodyCompList.innerHTML = html;
  console.log("🚀 Injected Body Comp HTML (editable):", html);
}




// --- Target Goals ---
const targetGoalsList = document.getElementById("targetGoals");
if (targetGoalsList) {
  const firstRow = rows[0];
  if (firstRow["Target Goals"]) {
    targetGoalsList.innerHTML = `<li><span class="editable">${firstRow["Target Goals"]}</span></li>`;
  } else {
    targetGoalsList.innerHTML = "";
  }
}

  console.log("🏁 injectPatientData END");
}



// ============================
// 5. Fetch & Match Patient Rows
// ============================
function csvToJSON(csv) {
  const rows = [];
  const lines = csv.split("\n");

  // Clean headers
  const headers = parseCSVLine(lines.shift()).map(h =>
    h.replace(/\uFEFF/g, "").trim()
  );

  lines.forEach(line => {
    if (!line.trim()) return;

    const values = parseCSVLine(line);

    // Ensure same length
    while (values.length < headers.length) values.push("");
    while (values.length > headers.length) values = values.slice(0, headers.length);

    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "").trim();
    });

    rows.push(obj);
  });

  return rows;
}



function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      cur += '"'; // escaped quote
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes; // toggle state
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);

  return result;
}


function getPatientIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts.pop() || parts.pop();
}

// ============================
// Load Patient Data (with cache-buster)
// ============================
async function loadPatientData() {
  console.log("🚀 loadPatientData() started");
  try {
    console.log("Fetching sheets...");
    const [wellnessRes, medsRes, lifestyleRes, bodyCompRes] = await Promise.all([
      fetch(TABS.wellness + "&cb=" + Date.now()).then(r => r.text()),
      fetch(TABS.meds + "&cb=" + Date.now()).then(r => r.text()),
      fetch(TABS.lifestyle + "&cb=" + Date.now()).then(r => r.text()),
      fetch(TABS.bodycomp + "&cb=" + Date.now()).then(r => r.text())
    ]);
    console.log("✅ Fetched all sheets");

    const wellnessData = csvToJSON(wellnessRes);
    const medsData = csvToJSON(medsRes);
    const lifestyleData = csvToJSON(lifestyleRes);
    const bodyCompData = csvToJSON(bodyCompRes);

    console.log("CSV Headers (Wellness):", Object.keys(wellnessData[0] || {}));
    console.log("CSV Headers (Meds):", Object.keys(medsData[0] || {}));
    console.log("CSV Headers (Lifestyle):", Object.keys(lifestyleData[0] || {}));
    console.log("CSV Headers (BodyComp):", Object.keys(bodyCompData[0] || {}));

    const patientId = getPatientIdFromUrl();
    console.log("Looking for Patient ID:", patientId);

    const patientRows = wellnessData.filter(r => (r["Patient ID"] || "").trim() === patientId.trim());
    console.log("Matched rows:", patientRows);

    if (patientRows.length > 0) {
      console.log("✅ Injecting data...");
      console.log("Patient Body Comp value:", patientRows[0]["Body Comp"]);
      console.log("BodyCompData States:", bodyCompData.map(b => b["State"]));
      injectPatientData(patientRows, lifestyleData, medsData, bodyCompData);
    } else {
      console.warn("⚠️ No patient found for ID:", patientId);
    }
  } catch (err) {
    console.error("❌ Error in loadPatientData:", err);
  }
}


// ============================
// 6. Bootstrap: always run loadPatientData
// ============================
function bootstrapWellnessPlan() {
  console.log("📌 Bootstrapping wellness plan, calling loadPatientData()");
  loadPatientData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapWellnessPlan);
} else {
  bootstrapWellnessPlan();
}
