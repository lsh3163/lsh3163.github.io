(() => {
  'use strict';
  const video = document.getElementById('hero-video');
  const asset = 'assets/prism/paper-20261013/';
  const demos = {
    rough: {src: 'explorer/videos/rough21-nominal-prism-seed401000.mp4', poster: asset + 'rough-nominal-poster.jpg', label: 'PRISM · Random rough terrain', description: 'G1 on uneven terrain · 20-second rollout, 0.5 m/s command.'},
    'rough-friction': {src: 'explorer/videos/rough21-friction_0p2-prism-seed401000.mp4', poster: asset + 'rough-friction_0p2-poster.jpg', label: 'PRISM · Low-friction rough terrain', description: 'Random rough terrain · Friction μ = 0.20, outside the training range · 20-second rollout.'},
    fall: {src: asset + 'humanoid-low-friction-paired-hero.mp4', full: asset + 'humanoid-low-friction-paired-full.mp4', poster: asset + 'humanoid-low-friction-paired-poster.jpg', label: 'Matched MLP vs PRISM · Flat terrain', description: 'Same initial state · MLP falls at 12.08 s; PRISM completes 24 s. Clip: 8–24 s.'}
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function respectMotion() { if (reduced.matches) { video.autoplay = false; video.pause(); } }
  respectMotion();
  reduced.addEventListener('change', respectMotion);
  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => {
      const d = demos[button.dataset.demo];
      const playing = !video.paused && !reduced.matches;
      document.querySelectorAll('[data-demo]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      video.pause();
      video.poster = d.poster;
      video.querySelector('source').src = d.src;
      video.setAttribute('aria-label', d.label);
      document.getElementById('video-label').textContent = d.label;
      document.getElementById('demo-description').textContent = d.description;
      document.getElementById('full-demo-link').href = d.full || d.src;
      video.load();
      if (playing) video.play().catch(() => {});
    });
  });
  document.getElementById('copy-citation').addEventListener('click', async () => {
    const citation = document.getElementById('citation');
    const status = document.getElementById('copy-status');
    try { await navigator.clipboard.writeText(citation.textContent); status.textContent = 'Copied'; }
    catch (_) { const range = document.createRange(); range.selectNodeContents(citation); const s = getSelection(); s.removeAllRanges(); s.addRange(range); status.textContent = 'Citation selected — copy with Ctrl/Cmd+C'; }
  });
})();
