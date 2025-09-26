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

  // Close any other open blurbs
  document.querySelectorAll(".learn-more-content.expanded")
    .forEach((openContent) => {
      if (openContent !== content) {
        openContent.classList.remove("expanded");
      }
    });

  // Toggle this one
  content.classList.toggle("expanded");
});


// ============================
// 4. Build Section Content From Sheet
// ============================
function injectPatientData(rows, lifestyleData) {
  // --- Goals & Follow-Up section headers ---
  const visitTitle = document.getElementById("visitTimelineTitle");
  if (visitTitle) visitTitle.textContent = cssVar("--visit-timeline-title");

  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompTitle) bodyCompTitle.textContent = cssVar("--bodycomp-title");

  const targetTitle = document.getElementById("targetTitle");
  if (targetTitle) targetTitle.textContent = cssVar("--target-title");

 // --- Group meds & supplements by category ---
const medsByCategory = {
  Daily: { meds: [], supps: [] },
  Evening: { meds: [], supps: [] },
  Weekly: { meds: [], supps: [] },
  PRN: { meds: [], supps: [] },
  "To Consider": { meds: [], supps: [] }
};

rows.forEach((r) => {
  const med = r["Meds/Supp"];
  const dose = r["Dose"] || "";
  const cat = (r["Category"] || "").trim();
  const blurb = r["Blurb"] || "";

  if (!med) return;

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



  // Check if category is Supplement or not
  if (cat.includes("Supplement")) {
    if (cat.startsWith("Daily")) medsByCategory.Daily.supps.push(medHtml);
    else if (cat.startsWith("Evening")) medsByCategory.Evening.supps.push(medHtml);
    else if (cat.startsWith("Weekly")) medsByCategory.Weekly.supps.push(medHtml);
    else if (cat.startsWith("PRN")) medsByCategory.PRN.supps.push(medHtml);
  } else {
    if (medsByCategory[cat]) medsByCategory[cat].meds.push(medHtml);
  }
});

// --- Inject into DOM ---
Object.entries(medsByCategory).forEach(([cat, { meds, supps }]) => {
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

  if (list && block) {
    if (meds.length > 0 || supps.length > 0) {
      let html = "";
      if (meds.length > 0) html += meds.join("");
      if (supps.length > 0) {
        html += `
          <li class="med-subtitle"><span>SUPPLEMENTS</span></li>
          ${supps.join("")}
        `;
      }
      list.innerHTML = html;
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
    const firstRow = rows[0]; // use first row for patient-level metadata
    visitTimelineList.innerHTML = `
      <li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${firstRow["Previous Visit"] || ""}</span></li>
      <li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${firstRow["Next Visit"] || ""}</span></li>
    `;
  }

  // --- Body Comp ---
  const bodyCompList = document.getElementById("bodyComp");
  if (bodyCompList) {
    const firstRow = rows[0];
    bodyCompList.innerHTML = firstRow["Body Comp"]
      ? `<li><span class="editable">${firstRow["Body Comp"]}</span></li>`
      : "";
  }

  // --- Target Goals ---
  const targetGoalsList = document.getElementById("targetGoals");
  if (targetGoalsList) {
    const firstRow = rows[0];
    targetGoalsList.innerHTML = firstRow["Target Goals"]
      ? `<li><span class="editable">${firstRow["Target Goals"]}</span></li>`
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
