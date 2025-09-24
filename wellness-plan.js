  // === Dynamic Resource Links via CSS Variables ===
  const setDynamicLink = (id, cssVar) => {
    const el = document.getElementById(id);
    const url = getComputedStyle(document.documentElement)
                  .getPropertyValue(cssVar)
                  .replace(/["']/g, '')
                  .trim();
    if (el && url) el.href = url;
  };

  const linkIds = [
    ['dynamicFollowUpLink', '--followup-url'],
    ['dynamicHormoneLink', '--hormone-resource-url'],
    ['dynamicAddOnsLink', '--treatment-addons-url'],
    ['dynamicStandardsLink', '--basic-standards-url'],
    ['dynamicCoachingLink', '--health-coaching-url'],
    ['dynamicTipsLink', '--lifestyle-tips-url'],
    ['dynamicFullscriptLink', '--fullscript-url'],
    ['dynamicNeedle27gLink', '--needle27g-url'],
    ['dynamicAlcoholPadsLink', '--alcohol-pads-url'],
    ['dynamicSubqVideoLink', '--subq-video-url']
  ];

  linkIds.forEach(([id, cssVar]) => setDynamicLink(id, cssVar));

  // === Remove all target="_blank" links
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.removeAttribute('target');
  });

  // === Learn More dropdown logic (adds/removes .expanded)
  document.querySelectorAll(".learn-more-toggle").forEach(button => {
    button.addEventListener("click", function () {
      const content = this.nextElementSibling;
      if (content) {
        content.classList.toggle("expanded");
        this.classList.toggle("expanded");
      }
    });
  });
