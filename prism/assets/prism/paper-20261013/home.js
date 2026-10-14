/* Progressive enhancement: all manuscript results remain readable without JS. */
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function activate(name, focus = false) {
    for (const tab of tabs) {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus();
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== null) { event.preventDefault(); activate(tabs[next].dataset.tab, true); }
    });
  });
  const video = document.getElementById('hero-video');
  const asset = 'assets/prism/paper-20261013/';
  const demos = {
    friction: {
      src: 'humanoid-low-friction-paired-hero.mp4',
      poster: 'humanoid-low-friction-paired-poster.jpg',
      full: 'humanoid-low-friction-paired-full.mp4',
      outcome: 'Falls at 12.08 s',
      description: 'Friction μ = 0.20 · Same reset and command schedule. Clip: 8–24 s of the shared trial.',
      aria: 'Low-friction comparison: Matched MLP falls at 12.08 seconds while PRISM completes the 24-second schedule.'
    },
    mass: {
      src: 'humanoid-mass-plus15-paired-full.mp4',
      poster: 'humanoid-mass-plus15-paired-poster.jpg',
      full: 'humanoid-mass-plus15-paired-full.mp4',
      outcome: 'Loses balance at 23.37 s',
      description: 'All robot links +15% mass · Same reset and command schedule. Full 0–24 s trial.',
      aria: 'Added-mass comparison: Matched MLP loses balance at 23.37 seconds while PRISM completes the 24-second schedule.'
    }
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function respectMotion() {
    if (reduced.matches) { video.autoplay = false; video.pause(); }
  }
  respectMotion();
  reduced.addEventListener('change', respectMotion);
  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => {
      const d = demos[button.dataset.demo];
      const continuePlaying = !video.paused && !reduced.matches;
      document.querySelectorAll('[data-demo]').forEach(other => {
        const selected = other === button;
        other.classList.toggle('active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      video.pause();
      video.poster = asset + d.poster;
      video.querySelector('source').src = asset + d.src;
      video.setAttribute('aria-label', d.aria);
      document.getElementById('baseline-outcome').textContent = d.outcome;
      document.getElementById('demo-description').textContent = d.description;
      document.getElementById('full-demo-link').href = asset + d.full;
      video.load();
      if (continuePlaying) video.play().catch(() => {});
    });
  });
  const citation = document.getElementById('copy-citation');
  citation.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    const text = document.getElementById('bibtex').textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied';
    } catch (_) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Select and copy the citation';
    }
  });
})();
