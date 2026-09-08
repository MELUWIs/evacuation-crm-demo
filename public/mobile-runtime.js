/* Layout only: no API calls, credentials, order mutations, or data transformations. */
(() => {
  if (window.__tpMobileLayout20260907) return;
  window.__tpMobileLayout20260907 = true;
  const html = document.documentElement;
  let frame = 0;
  function measure() {
    frame = 0;
    if (window.tpRuntimeIsTv) return;
    const viewport = window.visualViewport;
    if (!viewport || Math.abs(viewport.scale - 1) < .01) html.style.setProperty('--tp-viewport-height', `${Math.round(viewport?.height || window.innerHeight)}px`);
    const nav = document.querySelector('.mnav');
    if (nav) html.style.setProperty('--tp-nav-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
  window.addEventListener('resize', schedule, {passive:true});
  window.visualViewport?.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('DOMContentLoaded', () => {
    schedule();
    new MutationObserver(schedule).observe(document.getElementById('root'), {childList:true,subtree:true});
  }, {once:true});
  schedule();
})();
