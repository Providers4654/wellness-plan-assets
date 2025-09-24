
// === Wellness Plan Dynamic JS ===
const root = getComputedStyle(document.documentElement);

// Apply CSS var URLs to links
[
  ['dynamicFollowUpLink','--followup-url'],
  ['dynamicHormoneLink','--hormone-rx-resources'],
  ['dynamicAddOnsLink','--treatment-addons-url'],
  ['dynamicStandardsLink','--basic-standards-url'],
  ['dynamicCoachingLink','--health-coaching-url'],
  ['dynamicTipsLink','--lifestyle-tips-url'],
  ['dynamicFullscriptLink','--fullscript-url'],
  ['dynamicNeedle27gLink','--needle27g-url'],
  ['dynamicAlcoholPadsLink','--alcohol-pads-url'],
  ['dynamicSubqVideoLink','--subq-video-url']
].forEach(([id, v]) => {
  const el = document.getElementById(id),
        url = root.getPropertyValue(v).replace(/["']/g,'').trim();
  if (el && url) el.href = url;
});

// Remove all target="_blank"
document.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute('target'));

// === Dose Pill Dropdown Toggles ===
document.querySelectorAll(".dose.toggle-dose").forEach(dose => {
  dose.addEventListener("click", () => {
    dose.classList.toggle("expanded");
    const content = dose.parentElement.querySelector(".learn-more-content");
    if (content) {
      content.classList.toggle("expanded");
    }
  });
});
