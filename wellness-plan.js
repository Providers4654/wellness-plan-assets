// ============================
// WELLNESS PLAN DYNAMIC JS
// ============================

// 1. Apply CSS variable URLs to dynamic links
const root = getComputedStyle(document.documentElement);

[
  ['dynamicFollowUpLink','--followup-url'],
  ['dynamicHormoneLink','--hormone-resource-url'],
  ['dynamicAddOnsLink','--treatment-addons-url'],
  ['dynamicStandardsLink','--basic-standards-url'],
  ['dynamicCoachingLink','--health-coaching-url'],
  ['dynamicTipsLink','--lifestyle-tips-url'],
  ['dynamicFullscriptLink','--fullscript-url'],
  ['dynamicNeedle27gLink','--needle27g-url'],
  ['dynamicAlcoholPadsLink','--alcohol-pads-url'],
  ['dynamicSubqVideoLink','--subq-video-url']
].forEach(([id, varName]) => {
  const el = document.getElementById(id);
  const url = root.getPropertyValue(varName).replace(/["']/g, '').trim();
  if (el && url) el.href = url;
});

// 2. Remove all target="_blank" (force same-tab navigation)
document.querySelectorAll('a[target="_blank"]').forEach(a => {
  a.removeAttribute('target');
});

// 3. Info Icon Toggles (only one open at a time)
document.querySelectorAll(".info-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const row = icon.closest(".med-row");
    const content = row?.querySelector(".learn-more-content");

    if (!content) return;

    // Close all other open dropdowns
    document.querySelectorAll(".learn-more-content.expanded").forEach(openContent => {
      if (openContent !== content) {
        openContent.classList.remove("expanded");
      }
    });

    // Toggle this one
    content.classList.toggle("expanded");
  });
});
