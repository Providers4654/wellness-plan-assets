// ============================
// WELLNESS PLAN DYNAMIC JS (FIXED & CLEANED)
// ============================

const root = getComputedStyle(document.documentElement);

// ✅ add this helper back
function cssVar(name) {
  return root.getPropertyValue(name).trim();
}

// --- Provider-specific Wellness APIs ---
const PROVIDERS = {
  pj: {
    // Joe’s API (points to Joe's Wellness Plans sheet)
    wellness: "https://script.google.com/macros/s/AKfycbxkGzJ-26xHu_ta-3pUDi-LN5Op-r4zeJ3InU-H8woHHVKPU8digA1dFHoLVdvNldc/exec"
  },
  pb: {
    // Bryan’s API (points to Bryan's Wellness Plans sheet)
    wellness: "https://script.google.com/macros/s/AKfycbwxXJ0eDzxym6iTnzAN3a6lSdlorXQW4rfUkWJ-86zgDGe2S0wtGiEmdfyJ2tqIkQ-d/exec"
  }
  // add more providers later (pk, pm, etc.)
};




// --- Shared reference tabs (via API instead of CSV) ---
const TABS = {
  meds:       "https://script.google.com/macros/s/AKfycbxkGzJ-26xHu_ta-3pUDi-LN5Op-r4zeJ3InU-H8woHHVKPU8digA1dFHoLVdvNldc/exec?tab=Medication Info",
  lifestyle:  "https://script.google.com/macros/s/AKfycbxkGzJ-26xHu_ta-3pUDi-LN5Op-r4zeJ3InU-H8woHHVKPU8digA1dFHoLVdvNldc/exec?tab=Lifestyle Tips",
  bodycomp:   "https://script.google.com/macros/s/AKfycbxkGzJ-26xHu_ta-3pUDi-LN5Op-r4zeJ3InU-H8woHHVKPU8digA1dFHoLVdvNldc/exec?tab=Body Comp",
  toconsider: "https://script.google.com/macros/s/AKfycbxkGzJ-26xHu_ta-3pUDi-LN5Op-r4zeJ3InU-H8woHHVKPU8digA1dFHoLVdvNldc/exec?tab=To Consider"
};



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
// Info Icon + Name Toggles
// ============================
document.addEventListener("click", e => {
  const medNameEl = e.target.closest(".med-name"); 
  if (!medNameEl) return; // only react to clicks inside .med-name

  const row = medNameEl.closest(".med-row");
  const content = row?.querySelector(".learn-more-content");
  if (!content) return;

  // Close others
  document.querySelectorAll(".learn-more-content.expanded").forEach(openContent => {
    if (openContent !== content) openContent.classList.remove("expanded");
  });

  // Toggle this one
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

      // Define your desired order
      const CATEGORY_ORDER = ["Hormones", "Peptides", "Medications"];

      // Group meds by category
      const grouped = {};
      meds.forEach(med => {
        const info = toConsiderData.find(r => r["Medication"].trim() === med);
        if (!info) return;
        const category = (info["Category"] || "").trim() || "Other";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(info);
      });

      // Render in forced order
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

      // Render any extra categories not in the predefined order
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

// --- Parse provider + patient ID from URL ---
// Example: /pj/test-patient/999 → { providerCode: "pj", patientId: "999" }
function getProviderAndPatientIdFromUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const providerCode = parts[0];   // "pj" or "pb"
  const patientId = parts.pop();   // last segment (the ID)
  return { providerCode, patientId };
}







async function loadPatientData() {
  const start = performance.now(); // ⏱️ Start timer

  try {
    const { providerCode, patientId } = getProviderAndPatientIdFromUrl();
    const provider = PROVIDERS[providerCode];
    if (!provider) {
      console.error("❌ Unknown provider code:", providerCode);
      return;
    }

    console.log(`📋 Loading data for provider=${providerCode}, patientId=${patientId}`);

    const fetchStart = performance.now();
  const bundleUrl = `${provider.wellness}?bundle=1&id=${patientId}&provider=${providerCode}`;
    const bundle = await fetch(bundleUrl).then(r => r.json());
    const fetchEnd = performance.now();
    console.log(`⏱️ Fetch time: ${(fetchEnd - fetchStart).toFixed(2)} ms`);

    const parseStart = performance.now();
    console.log("🧾 Patient rows:", bundle.patientRows);
    const parseEnd = performance.now();
    console.log(`⏱️ Data parse/log time: ${(parseEnd - parseStart).toFixed(2)} ms`);

    if (Array.isArray(bundle.patientRows) && bundle.patientRows.length > 0) {
      const injectStart = performance.now();
      injectPatientData(
        bundle.patientRows,
        bundle.lifestyle,
        bundle.meds,
        bundle.bodycomp,
        bundle.toconsider
      );
      const injectEnd = performance.now();
      console.log(`⏱️ DOM inject time: ${(injectEnd - injectStart).toFixed(2)} ms`);
    } else {
      console.warn(`⚠️ No patient data returned for ID=${patientId}`);
    }

    const end = performance.now();
    console.log(`✅ Total load time: ${(end - start).toFixed(2)} ms`);

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
