// Routed DiT-Policy project page — minimal interactivity.

document.addEventListener('DOMContentLoaded', function () {
  // Ensure muted demo videos autoplay/loop even if the browser blocks it
  // until the element is in/near view.
  const videos = document.querySelectorAll('video[autoplay]');
  videos.forEach(function (v) {
    v.muted = true;
    v.setAttribute('playsinline', '');
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { /* autoplay blocked; user can click to play */ });
      }
    };
    tryPlay();
  });

  // Lazy-start videos when they scroll into view (saves bandwidth/CPU).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach((v) => io.observe(v));
  }

  // BibTeX copy-to-clipboard.
  const copyBtn = document.getElementById('bibtex-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const code = document.getElementById('bibtex-code');
      if (!code) return;
      const text = code.innerText;
      navigator.clipboard.writeText(text).then(function () {
        const original = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = original; }, 1500);
      });
    });
  }
});
