// Sets the day or night theme before the page is drawn. A saved choice wins; otherwise the system setting is followed.
(function () {
  'use strict';
  const root = document.documentElement;
  const light = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  let choice = 'system';
  try {
    const text = localStorage.getItem('game-vault-water-sort-v1');
    const raw = text && text.length < 600000 ? JSON.parse(text) : null;
    if (raw && raw.version === 1 && (raw.theme === 'day' || raw.theme === 'night')) choice = raw.theme;
  } catch (error) { /* Unavailable or unreadable storage leaves the system setting in charge. */ }
  const current = () => choice === 'system' ? (light && light.matches ? 'day' : 'night') : choice;
  const apply = () => { root.dataset.theme = current(); };
  apply();
  window.WaterSortTheme = {
    choice: () => choice,
    current,
    toggle() { choice = current() === 'day' ? 'night' : 'day'; apply(); return choice; },
    follow(listener) {
      if (light && light.addEventListener) light.addEventListener('change', () => { if (choice === 'system') { apply(); listener(); } });
    }
  };
})();
