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
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
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
  const medsByCategory = { Daily:{meds:[],supps:[]}, Evening:{meds:[],supps:[]}, Weekly:{meds:[],supps:[]}, PRN:{meds:[],supps:[]} };

  rows.forEach((r, idx) => {
    console.log(`Processing row ${idx}:`, r);

    const med = getField(r, ["Meds/Supp", "Medication", "Med"]);
    if (!med) {
      console.log(`⚪ Row ${idx}: skipping (no Meds/Supp)`);
      return;
    }

    const dose = getField(r, ["Dose", "Dosing"]) || "";
    const cat  = (getField(r, ["Category", "Cat"]) || "").trim();
    console.log(`➡️ Row ${idx}: Med="${med}", Dose="${dose}", Cat="${cat}"`);

    let blurb = "";
    const medInfo = medsData.find(m => m["Medication"] === med);
    if (medInfo) {
      blurb = medInfo["Blurb"] || "";
      console.log(`   ↳ Found medInfo for "${med}" → blurb length=${blurb.length}`);
    }

    const medHtml = `
      <li class="med-row">
        <div class="med-name"><strong>${med}</strong>${blurb ? `<span class="info-icon">i</span>` : ""}</div>
        <div class="dose">${dose}</div>
        ${blurb ? `<div class="learn-more-content">${normalizeCellText(blurb)}</div>` : ""}
      </li>
    `;

    if (cat.includes("Supplement")) {
      if (cat.startsWith("Daily")) medsByCategory.Daily.supps.push(medHtml);
      else if (cat.startsWith("Evening")) medsByCategory.Evening.supps.push(medHtml);
      else if (cat.startsWith("Weekly")) medsByCategory.Weekly.supps.push(medHtml);
      else if (cat.startsWith("PRN")) medsByCategory.PRN.supps.push(medHtml);
      else console.log(`⚠️ Row ${idx}: Supplement with unknown category "${cat}"`);
    } else if (medsByCategory[cat]) {
      medsByCategory[cat].meds.push(medHtml);
    } else {
      console.log(`⚠️ Row ${idx}: Category "${cat}" not in [Daily, Evening, Weekly, PRN]`);
    }
  });

  console.log("📦 Final medsByCategory:", JSON.stringify(medsByCategory, null, 2));

  Object.entries(medsByCategory).forEach(([cat,{meds,supps}])=>{
    const listId={Daily:"dailyMeds",Evening:"eveningMeds",Weekly:"weeklyMeds",PRN:"prnMeds"}[cat];
    const blockId={Daily:"dailyBlock",Evening:"eveningBlock",Weekly:"weeklyBlock",PRN:"prnBlock"}[cat];
    const block=document.getElementById(blockId);
    const list=document.getElementById(listId);

    if (!list || !block) {
      console.log(`⚠️ Missing DOM block for ${cat}`);
      return;
    }

    if (meds.length>0||supps.length>0){
      console.log(`➡️ Rendering ${cat}: ${meds.length} meds, ${supps.length} supps`);
      let html=meds.join("");
      if(supps.length>0) html+=`<li class="med-subtitle"><span>SUPPLEMENTS</span></li>${supps.join("")}`;
      list.innerHTML=html;
    } else {
      console.log(`❌ ${cat} empty → removing block`);
      block.remove();
    }
  });

  // --- To Consider ---
  const toConsiderList = document.getElementById("toConsider");
  const toConsiderBlock = document.getElementById("toConsiderBlock");
  if (toConsiderList && toConsiderBlock) {
    const meds = rows
      .map(r => getField(r, ["To Consider", "Consider"]))
      .join(",")
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    console.log("Parsed To Consider meds (all rows):", meds);

    if (meds.length > 0) {
      let html = "";
      const CATEGORY_ORDER = ["Hormones", "Peptides", "Medications"];
      const grouped = {};

      meds.forEach(med => {
        const info = toConsiderData.find(r => r["Medication"].trim() === med);
        if (info) {
          const category = (info["Category"] || "").trim() || "Other";
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(info);
        } else {
          if (!grouped["Custom"]) grouped["Custom"] = [];
          grouped["Custom"].push({ Medication: med, Blurb: "" });
        }
      });

      CATEGORY_ORDER.concat(Object.keys(grouped)).forEach(cat => {
        if (grouped[cat]) {
          html += `<li class="to-consider-subtitle">${cat}</li>`;
          grouped[cat].forEach(info => {
            html += `
              <li class="to-consider-row">
                <div><strong>${info["Medication"]}</strong></div>
                <div>${normalizeCellText(info["Blurb"] || "")}</div>
              </li>`;
          });
        }
      });

      toConsiderList.innerHTML = html;
      toConsiderBlock.style.display = "block";
    } else {
      toConsiderBlock.style.display = "none";
    }
  }

  // --- Lifestyle Tips ---
  const lifestyleBlock = document.getElementById("lifestyleTips");
  if (lifestyleBlock) {
    const selectedTips = rows
      .map(r => getField(r, ["Lifestyle Tips","Lifestyle/Type"]))
      .filter(Boolean)
      .map(v => v.trim());

    console.log("Lifestyle tips (all rows):", selectedTips);

    if (selectedTips.length > 0) {
      let html = "";
      selectedTips.forEach(tipName => {
        const tipInfo = lifestyleData.find(r => r["Tip"].trim() === tipName);
        if (tipInfo) {
          html += `
            <li>
              <span class="editable">
                <strong>${tipInfo["Tip"]}:</strong><br>
                ${normalizeCellText(tipInfo["Blurb"])}
              </span>
            </li>`;
        } else {
          html += `<li><span class="editable">${normalizeCellText(tipName)}</span></li>`;
        }
      });
      lifestyleBlock.innerHTML = html;
    } else {
      lifestyleBlock.innerHTML = "";
    }
  }

  // --- Body Comp ---
  const bodyCompList = document.getElementById("bodyComp");
  if (bodyCompList && bodyCompTitle) {
    const keys = rows
      .map(r => getField(r, ["Body Comp","Body Composition"]))
      .filter(Boolean)
      .map(v => v.trim());

    console.log("Body Comp keys (all rows):", keys);

    if (keys.length > 0) {
      let html = "";
      keys.forEach(key => {
        const compRow = bodyCompData.find(b => (b["State"] || "").trim() === key);
        if (compRow && compRow["Blurb"]) {
          html += `<li><span class="editable">${normalizeCellText(compRow["Blurb"])}</span></li>`;
        } else {
          html += `<li><span class="editable">${normalizeCellText(key)}</span></li>`;
        }
      });
      bodyCompList.innerHTML = html;
    } else {
      if (bodyCompTitle) bodyCompTitle.remove();
      bodyCompList.remove();
    }
  }

  // --- Target Goals ---
  const targetGoalsList = document.getElementById("targetGoals");
  if (targetGoalsList && targetTitle) {
    const allGoals = rows
      .map(r => getField(r, ["Target Goals","Goals"]))
      .join(",")
      .split(/[,;\n]/)
      .map(g => g.trim())
      .filter(Boolean);

    console.log("Target Goals (all rows):", allGoals);

    if (allGoals.length > 0) {
      let html = "";
      allGoals.forEach(g => {
        html += `<li><span class="editable">${normalizeCellText(g)}</span></li>`;
      });
      targetGoalsList.innerHTML = html;
    } else {
      if (targetTitle) targetTitle.remove();
      targetGoalsList.remove();
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
  const parts=window.location.pathname.split("/").filter(Boolean);
  const providerCode=parts[0]; const patientId=parts.pop();
  return {providerCode,patientId};
}

async function loadPatientData() {
  const start=performance.now();
  try {
    const {providerCode,patientId}=getProviderAndPatientIdFromUrl();
    const provider=PROVIDERS[providerCode];
    if(!provider) return console.error("❌ Unknown provider:",providerCode);
    console.log(`📋 Loading data for provider=${providerCode}, patientId=${patientId}`);
    const [patientRows,medsData,lifestyleData,bodyCompData,toConsiderData]=await Promise.all([
      fetchCsv(provider.wellness), fetchCsv(TABS.meds), fetchCsv(TABS.lifestyle), fetchCsv(TABS.bodycomp), fetchCsv(TABS.toconsider),
    ]);
    if(patientRows.length>0){
      console.log("Headers from CSV:",Object.keys(patientRows[0]));
      console.log("First 10 Patient IDs:",patientRows.slice(0,10).map(r=>getIdField(r)));
    } else {console.warn("⚠️ CSV returned no rows at all");}
    const patientBlock=getPatientBlock(patientRows,patientId);
    if(patientBlock.length>0){injectPatientData(patientBlock,lifestyleData,medsData,bodyCompData,toConsiderData);}
    else {console.warn(`⚠️ No rows found for Patient ID=${patientId}`);}
    console.log(`✅ Total load time: ${(performance.now()-start).toFixed(2)} ms`);
  } catch(err){console.error("❌ Error in loadPatientData:",err);}
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

