// ============================
// WELLNESS PLAN LOADER (HTML + CSS + JS)
// ============================

(() => {
  const manualBump = "1"; // set to "" for normal daily refresh

  const today = new Date();
  const daily =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const version = daily + (manualBump ? "-" + manualBump : "");
  const ts = Date.now();

  // === 1. Load HTML shell ===
  fetch(`https://providers4654.github.io/wellness-plan-assets/wellness-plan.html?v=${version}&t=${ts}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("wellness-root").innerHTML = html;


      // === 2. Load CSS after HTML ===
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = `https://providers4654.github.io/wellness-plan-assets/wellness-plan.css?v=${version}&t=${ts}`;
      cssLink.crossOrigin = "anonymous";
      cssLink.referrerPolicy = "no-referrer";
      document.head.appendChild(cssLink);

      // === 3. Load JS logic after HTML ===
      const jsScript = document.createElement("script");
      jsScript.src = `https://providers4654.github.io/wellness-plan-assets/wellness-plan.js?v=${version}&t=${ts}`;
      jsScript.crossOrigin = "anonymous";
      jsScript.referrerPolicy = "no-referrer";
      jsScript.onload = () => {
        console.log("[Loader] wellness-plan.js loaded");

      };
      document.body.appendChild(jsScript);
    })
    .catch(err => console.error("[Wellness Loader] Failed to load HTML", err));

  console.log(`[Wellness Plan Loader] version=${version}, ts=${ts}`);
})();
