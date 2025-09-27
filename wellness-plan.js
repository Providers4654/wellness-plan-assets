// ============================
// WELLNESS PLAN DYNAMIC JS (FIXED & CLEANED)
// ============================

const root = getComputedStyle(document.documentElement);

const TABS = {
  wellness:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=0&single=true&output=csv",
  meds:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1442071508&single=true&output=csv",
  lifestyle:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1970185497&single=true&output=csv",
  bodycomp:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1795189157&single=true&output=csv",
  toconsider: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1041049772&single=true&output=csv"
};



// --- Helper: Read CSS vars safely
function cssVar(name) {
  let val = root.getPropertyValue(name).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return val;
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
// Remove target="_blank"
// ============================
document.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute("target"));

// ============================
// Info Icon Toggles
// ============================
document.addEventListener("click", e => {
  if (!e.target.classList.contains("info-icon")) return;
  const row = e.target.closest(".med-row");
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

 
// Inject standard meds
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
    let lastCategory = "";

    meds.forEach(med => {
      let info = toConsiderData.find(r => r["Medication"].trim() === med);
      if (!info) return;

      const blurb = info["Blurb"] || "";
      const category = (info["Category"] || "").trim();

// Insert subtitle only if group has meds
if (category && category !== lastCategory) {
  // check ahead if this category actually has at least one med
  const categoryMeds = meds.filter(m => {
    const info = toConsiderData.find(r => r["Medication"].trim() === m);
    return info && (info["Category"] || "").trim() === category;
  });
  if (categoryMeds.length > 0) {
    html += `<li class="to-consider-subtitle">${category}</li>`;
    lastCategory = category;
  }
}


      html += `
        <li class="to-consider-row">
          <div class="to-consider-name"><strong>${med}</strong></div>
          ${blurb ? `<div class="to-consider-blurb">${normalizeCellText(blurb)}</div>` : ""}
        </li>
      `;
    });

    toConsiderList.innerHTML = html;
  } else {
    toConsiderBlock.remove();
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
// CSV Helpers
// ============================
function csvToJSON(csv) {
  const rows = [];
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines.shift()).map(h => h.replace(/\uFEFF/g, "").trim());

  lines.forEach(line => {
    if (!line.trim()) return;
    let values = parseCSVLine(line);
    while (values.length < headers.length) values.push("");
    while (values.length > headers.length) values = values.slice(0, headers.length);

    const obj = {};
    headers.forEach((h, i) => obj[h] = (values[i] || "").trim());
    rows.push(obj);
  });
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let cur = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') { cur += '"'; i++; }
    else if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { result.push(cur); cur = ""; }
    else cur += char;
  }
  result.push(cur);
  return result;
}

function getPatientIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts.pop() || parts.pop();
}

// ============================
// Load Patient Data
// ============================
async function loadPatientData() {
  try {
const [wellnessRes, medsRes, lifestyleRes, bodyCompRes, toConsiderRes] = await Promise.all([
  fetch(TABS.wellness + "&cb=" + Date.now()).then(r => r.text()),
  fetch(TABS.meds + "&cb=" + Date.now()).then(r => r.text()),
  fetch(TABS.lifestyle + "&cb=" + Date.now()).then(r => r.text()),
  fetch(TABS.bodycomp + "&cb=" + Date.now()).then(r => r.text()),
  fetch(TABS.toconsider + "&cb=" + Date.now()).then(r => r.text())
]);

const wellnessData = csvToJSON(wellnessRes);
const medsData = csvToJSON(medsRes);
const lifestyleData = csvToJSON(lifestyleRes);
const bodyCompData = csvToJSON(bodyCompRes);
const toConsiderData = csvToJSON(toConsiderRes);


    const patientId = getPatientIdFromUrl();
    const patientRows = wellnessData.filter(r => (r["Patient ID"] || "").trim() === patientId.trim());

    if (patientRows.length > 0) {
      injectPatientData(patientRows, lifestyleData, medsData, bodyCompData, toConsiderData);
    } else {
      console.warn("⚠️ No patient found for ID:", patientId);
    }
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
