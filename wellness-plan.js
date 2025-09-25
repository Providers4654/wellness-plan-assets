// ============================
// WELLNESS PLAN DYNAMIC JS
// ============================

const root = getComputedStyle(document.documentElement);

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Bi2xiUKiVQaoTioPuFRR80FnErpRYewmt9bHTrkFW7KSUeiXBoZM3bJZHGzFgDWA3lYrb5_6T5WO/pub?gid=0&single=true&output=csv";


// ============================
// 1. Apply CSS variable URLs to dynamic links
// ============================
[
  ['dynamicFollowUpLink',   '--followup-url'],
  ['dynamicHormoneLink',    '--hormone-resource-url'],
  ['dynamicAddOnsLink',     '--treatment-addons-url'],
  ['dynamicStandardsLink',  '--basic-standards-url'],
  ['dynamicCoachingLink',   '--health-coaching-url'],
  ['dynamicTipsLink',       '--lifestyle-tips-url'],
  ['dynamicFullscriptLink', '--fullscript-url'],
  ['dynamicNeedle27gLink',  '--needle27g-url'],
  ['dynamicAlcoholPadsLink','--alcohol-pads-url'],
  ['dynamicSubqVideoLink',  '--subq-video-url']
].forEach(([id, varName]) => {
  const el  = document.getElementById(id);
  const url = root.getPropertyValue(varName).replace(/["']/g, '').trim();
  if (el && url) el.href = url;
});


// ============================
// 1b. Apply CSS variable TEXT to placeholders
// ============================

// helper
function cssVar(name) {
  return root.getPropertyValue(name).replace(/["']/g, "").trim();
}

// Supplements (Fullscript)
const fsText = document.getElementById("fullscriptText");
if (fsText) fsText.textContent = cssVar("--fullscript-text");
const fsNote = document.getElementById("fullscriptNote");
if (fsNote) fsNote.textContent = cssVar("--fullscript-note");

// Add-ons
const addonsText = document.getElementById("addonsText");
if (addonsText) addonsText.textContent = cssVar("--addons-text");
const addonsNote = document.getElementById("addonsNote");
if (addonsNote) addonsNote.textContent = cssVar("--addons-note");

// Standards
const standardsText = document.getElementById("standardsText");
if (standardsText) standardsText.textContent = cssVar("--standards-text");

// Follow-Up button text
const followBtn = document.getElementById("followupText");
if (followBtn) followBtn.textContent = cssVar("--followup-text");

// Section headings
const visitTitle = document.getElementById("visitTimelineTitle");
if (visitTitle) visitTitle.textContent = cssVar("--visit-timeline-title");
const bodyTitle = document.getElementById("bodyCompTitle");
if (bodyTitle) bodyTitle.textContent = cssVar("--bodycomp-title");
const targetTitle = document.getElementById("targetTitle");
if (targetTitle) targetTitle.textContent = cssVar("--target-title");


// ============================
// 2. Remove all target="_blank" (force same-tab navigation)
// ============================
document.querySelectorAll('a[target="_blank"]').forEach(a => {
  a.removeAttribute('target');
});


// ============================
// 3. Info Icon Toggles (only one open at a time)
// ============================
document.querySelectorAll(".info-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const row     = icon.closest(".med-row");
    const content = row?.querySelector(".learn-more-content");

    if (!content) return;

    document.querySelectorAll(".learn-more-content.expanded").forEach(openContent => {
      if (openContent !== content) openContent.classList.remove("expanded");
    });

    content.classList.toggle("expanded");
  });
});


// ============================
// 4. Build Section Content From Sheet
// ============================
function injectPatientData(rows) {
  // --- Group meds by category ---
  const medsByCategory = {
    "Daily": [],
    "Evening": [],
    "Weekly": [],
    "PRN": [],
    "To Consider": [],
  };

  rows.forEach(r => {
    const med   = r["Meds/Supp"];
    const dose  = r["Dose"] || "";
    const cat   = r["Category"] || "";
    if (!med) return;

    const medHtml = `
      <li class="med-row">
        <strong>${med}</strong>
        <div class="dose">${dose}</div>
      </li>
    `;

    if (medsByCategory[cat]) {
      medsByCategory[cat].push(medHtml);
    }
  });

  // --- Inject into DOM, only if category has meds ---
  Object.keys(medsByCategory).forEach(cat => {
    const listId = {
      "Daily": "dailyMeds",
      "Evening": "eveningMeds",
      "Weekly": "weeklyMeds",
      "PRN": "prnMeds",
      "To Consider": "toConsider",
    }[cat];

    const block = document.getElementById(`${listId}Block`);
    const list  = document.getElementById(listId);

    if (list && block) {
      if (medsByCategory[cat].length > 0) {
        list.innerHTML = medsByCategory[cat].join("");

        // Insert supplements subtitle if any "Supplement" meds exist
        if (rows.some(r => r["Category"] === `${cat} Supplement`)) {
          const subtitle = `<li class="med-subtitle"><span>${cssVar("--title-supplements")}</span></li>`;
          list.insertAdjacentHTML("afterbegin", subtitle);
        }
      } else {
        // Remove entire section if no meds
        block.remove();
      }
    }
  });

  // --- Lifestyle Tips ---
  const lifestyleList = document.getElementById("lifestyleTips");
  if (lifestyleList) {
    const tips = rows.map(r => r["Lifestlye Tips"]).filter(Boolean);
    lifestyleList.innerHTML = tips.map(t => `<li>${t}</li>`).join("");
  }

  // --- Visit Timeline ---
  const visitTimelineTitle = document.getElementById("visitTimelineTitle");
  if (visitTimelineTitle) {
    visitTimelineTitle.textContent = cssVar("--visit-timeline-title");
  }
  const visitTimelineList = document.getElementById("visitTimeline");
  if (visitTimelineList) {
    const row = rows[0];
    visitTimelineList.innerHTML = `
      <li><span class="editable"><strong>${cssVar("--visit-prev-label")}</strong> ${row["Previous Visit"] || ""}</span></li>
      <li><span class="editable"><strong>${cssVar("--visit-next-label")}</strong> ${row["Next Visit"] || ""}</span></li>
    `;
  }

  // --- Body Comp ---
  const bodyCompTitle = document.getElementById("bodyCompTitle");
  if (bodyCompTitle) {
    bodyCompTitle.textContent = cssVar("--bodycomp-title");
  }
  const bodyCompList = document.getElementById("bodyComp");
  if (bodyCompList) {
    bodyCompList.innerHTML = rows[0]["Body Comp"]
      ? `<li><span class="editable">${rows[0]["Body Comp"]}</span></li>`
      : "";
  }

  // --- Target Goals ---
  const targetTitle = document.getElementById("targetTitle");
  if (targetTitle) {
    targetTitle.textContent = cssVar("--target-title");
  }
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
  const rows = csv.split("\n").map(r => r.split(","));
  const headers = rows.shift();
  return rows.filter(r => r.some(cell => cell.trim() !== "")).map(row => {
    let obj = {};
    row.forEach((val, i) => { obj[headers[i]?.trim()] = val.trim(); });
    return obj;
  });
}

function getPatientIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts.pop() || parts.pop(); // last segment
}

async function loadPatientData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const data = csvToJSON(text);

    const patientId = getPatientIdFromUrl();
    const patientRows = data.filter(r => r["Patient ID"] === patientId);

    if (patientRows.length > 0) {
      injectPatientData(patientRows);
    } else {
      console.warn("No patient found for ID:", patientId);
    }
  } catch (err) {
    console.error("Error fetching sheet:", err);
  }
}

// --- Run on load ---
loadPatientData();
