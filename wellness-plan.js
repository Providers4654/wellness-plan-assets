// ============================
// WELLNESS PLAN DYNAMIC JS (FIXED)
// ============================

const root = getComputedStyle(document.documentElement);

const TABS = {
  wellness: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=0&single=true&output=csv",
  meds: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1442071508&single=true&output=csv",
  lifestyle: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=1970185497&single=true&output=csv"
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

// Standards
const standardsText = document.getElementById("standardsText");
if (standardsText) standardsText.textContent = cssVar("--standards-text");
const standardsNote = document.getElementById("standardsNote");
if (standardsNote) standardsNote.textContent = cssVar("--standards-note");

// Coaching
const coachingLink = document.getElementById("dynamicCoachingLink");
if (coachingLink) coachingLink.textContent = cssVar("--coaching-text");
const coachingNote = document.getElementById("coachingNote");
if (coachingNote) coachingNote.textContent = cssVar("--coaching-note");


const followBtn = document.getElementById("followupText");
if (followBtn) followBtn.textContent = cssVar("--followup-text");

document.querySelector(".title-plan").textContent = cssVar("--title-plan");
document.querySelector(".title-summary").textContent = cssVar("--title-summary");
document.querySelector(".title-lifestyle").textContent = cssVar("--title-lifestyle");
document.querySelector(".title-goals").textContent = cssVar("--title-goals");

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

  document.querySelectorAll(".learn-more-content.expanded")
    .forEach((openContent) => {
      if (openContent !== content) openContent.classList.remove("expanded");
    });

  content.classList.toggle("expanded");
});

// ============================
// 4. Build Section Content
// ============================
function injectPatientData(rows, lifestyleData) {
  // --- Goals & Follow-Up section headers ---
  const visitTitle = document.getElementById("visitTimelineTitle");
  if (visitTitle) visitTitle.textContent = cssVar("--visit-timeline-title");

  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompTitle) bodyCompTitle.textContent = cssVar("--bodycomp-title");

  const targetTitle = document.getElementById("targetTitle");
  if (targetTitle) targetTitle.textContent = cssVar("--target-title");

  // --- Group meds by category ---
  const medsByCategory = { Daily: [], Evening: [], Weekly: [], PRN: [], "To Consider": [] };

  rows.forEach((r) => {
    const med = r["Meds/Supp"];
    const dose = r["Dose"] || "";
    const cat = r["Category"] || "";
    const blurb = r["Blurb"] || "";
    if (!med) return;

const medHtml = `
  <li class="med-row">
    <strong>${med}</strong>
    <span class="info-icon" title="More info">ℹ</span>
    <div class="dose">${dose}</div>
    <div class="learn-more-content">${r["Blurb"] || ""}</div>
  </li>
`;


    if (medsByCategory[cat]) medsByCategory[cat].push(medHtml);
  });

  Object.keys(medsByCategory).forEach((cat) => {
    const listId = { Daily: "dailyMeds", Evening: "eveningMeds", Weekly: "weeklyMeds", PRN: "prnMeds", "To Consider": "toConsider" }[cat];
    const blockId = { Daily: "dailyBlock", Evening: "eveningBlock", Weekly: "weeklyBlock", PRN: "prnBlock", "To Consider": "toConsiderBlock" }[cat];
    const block = document.getElementById(blockId);
    const list = document.getElementById(listId);

    if (list && block) {
      if (medsByCategory[cat].length > 0) {
        list.innerHTML = medsByCategory[cat].join("");
      } else {
        block.remove();
      }
    }
  });

  // --- Lifestyle Tips ---
  const lifestyleList = document.getElementById("lifestyleTips");
  if (lifestyleList) {
    const tips = rows.map(r => r["Lifestyle Tips"]).filter(Boolean);

    lifestyleList.innerHTML = tips.map(tip => {
      const lib = lifestyleData.find(l => l["Tip"] === tip);
      return `
        <li>
          <strong>${tip}</strong>
          ${lib && lib["Blurb"] ? `<div class="tip-blurb">${lib["Blurb"]}</div>` : ""}
        </li>
      `;
    }).join("");
  }

  // --- Visit Timeline ---
  const visitTimelineList = document.getElementById("visitTimeline");
  if (visitTimelineList) {
    const row = rows[0];
    visitTimelineList.innerHTML = `
      <li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${row["Previous Visit"] || ""}</span></li>
      <li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${row["Next Visit"] || ""}</span></li>
    `;
  }

  // --- Body Comp ---
  const bodyCompList = document.getElementById("bodyComp");
  if (bodyCompList) {
    bodyCompList.innerHTML = rows[0]["Body Comp"]
      ? `<li><span class="editable">${rows[0]["Body Comp"]}</span></li>`
      : "";
  }

  // --- Target Goals ---
  const targetGoalsList = document.getElementById("targetGoals");
  if (targetGoalsList) {
    targetGoalsList.innerHTML = rows[0]["Target Goals"]
      ? `<li><span class="editable">${rows[0]["Target Goals"]}</span></li>`
      : "";
  }
}

// ============================
// 5. Fetch & Match Patient Rows
// ============================
function csvToJSON(csv) {
  const rows = [];
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines.shift());

  lines.forEach(line => {
    if (!line.trim()) return;
    const values = parseCSVLine(line);
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || "").trim();
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
      // Handle escaped double quotes
      cur += '"';
      i++;
    } else if (char === '"') {
      // Toggle quoted state
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      // End of cell
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

async function loadPatientData() {
  try {
    const [wellnessRes, lifestyleRes] = await Promise.all([
      fetch(TABS.wellness).then(r => r.text()),
      fetch(TABS.lifestyle).then(r => r.text())
    ]);

    const wellnessData = csvToJSON(wellnessRes);
    const lifestyleData = csvToJSON(lifestyleRes);

    const patientId = getPatientIdFromUrl();
    const patientRows = wellnessData.filter(r => r["Patient ID"] === patientId);

    if (patientRows.length > 0) {
      injectPatientData(patientRows, lifestyleData);
    } else {
      console.warn("No patient found for ID:", patientId);
    }
  } catch (err) {
    console.error("Error fetching sheet:", err);
  }
}

// --- Run on load ---
loadPatientData();
