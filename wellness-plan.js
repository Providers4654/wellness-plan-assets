<script>
// === Wellness Plan Dynamic JS ===
const root = getComputedStyle(document.documentElement);

// Apply CSS var URLs to links
[
  ['dynamicFollowUpLink','--followup-url'],
  ['dynamicHormoneLink','--hormone-resource-url'],
  ['dynamicAddOnsLink','--treatment-addons-url'],
  ['dynamicStandardsLink','--basic-hlth-standards'],
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

// Learn More dropdown toggles
document.querySelectorAll(".learn-more-toggle").forEach(btn =>
  btn.addEventListener("click", () => {
    btn.classList.toggle("expanded");
    btn.nextElementSibling?.classList.toggle("expanded");
  })
);

// === Info Icon Toggles ===
document.querySelectorAll('.info-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const content = icon.closest('.med-row').querySelector('.learn-more-content');
    content.classList.toggle('expanded');
  });
});
</script>
