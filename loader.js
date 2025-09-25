// ============================
// WELLNESS PLAN CSS/JS LOADER
// ============================

(() => {
  // Manual override (set to "" for normal daily refresh)
  const manualBump = "1";

  // Daily cache-buster (YYYYMMDD)
  const today = new Date();
  const daily =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  // Final version string
  const version = daily + (manualBump ? "-" + manualBump : "");

  // Extra timestamp (hard refresh fallback)
  const ts = Date.now();

  // === Load CSS ===
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `https://providers4654.github.io/wellness-plan-assets/wellness-plan.css?v=${version}&t=${ts}`;
  cssLink.crossOrigin = "anonymous";
  cssLink.referrerPolicy = "no-referrer";
  document.head.appendChild(cssLink);

  // === Load JS (dropdowns + dynamic links) ===
  const jsScript = document.createElement("script");
  jsScript.src = `https://providers4654.github.io/wellness-plan-assets/wellness-plan.js?v=${version}&t=${ts}`;
  jsScript.defer = true;
  jsScript.crossOrigin = "anonymous";
  jsScript.referrerPolicy = "no-referrer";
  document.head.appendChild(jsScript);

  // Debug log
  console.log(`[Wellness Plan Loader] version ${version}, ts=${ts}`);
})();
