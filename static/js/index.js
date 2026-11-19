// Routed DiT-Policy project page — lightweight interactivity (no dependencies).

document.addEventListener('DOMContentLoaded', function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Videos: load & play only while visible ----------
  const videos = document.querySelectorAll('video[data-autoplay]');
  videos.forEach(function (v) {
    v.muted = true;
    v.setAttribute('playsinline', '');
  });

  const safePlay = function (v) {
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          safePlay(v);
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25, rootMargin: '100px 0px' });
    videos.forEach(function (v) { io.observe(v); });
  } else {
    // Fallback / reduced motion: show controls and let the user start playback.
    videos.forEach(function (v) { v.controls = true; });
  }

  // Click a video to toggle play/pause.
  videos.forEach(function (v) {
    v.addEventListener('click', function () {
      if (v.paused) safePlay(v); else v.pause();
    });
  });

  // ---------- Navbar: scrolled state, mobile toggle, active section ----------
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const backToTop = document.getElementById('back-to-top');

  const onScroll = function () {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 120);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (links && 'IntersectionObserver' in window) {
    const navLinks = Array.from(links.querySelectorAll('a[href^="#"]'));
    const byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    const sections = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-active'); });
          const a = byId[entry.target.id];
          if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------- Lightbox: click any figure to enlarge ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  const closeLightbox = function () {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.style.overflow = '';
  };

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.figure-block img, .method-figure img').forEach(function (img) {
      img.setAttribute('tabindex', '0');
      const open = function () {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  // ---------- BibTeX copy-to-clipboard ----------
  const copyBtn = document.getElementById('bibtex-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const code = document.getElementById('bibtex-code');
      if (!code) return;
      const label = copyBtn.querySelector('span:last-child');
      const done = function () {
        if (!label) return;
        const original = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(function () { label.textContent = original; }, 1500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code.innerText).then(done);
      } else {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
        sel.removeAllRanges();
      }
    });
  }
});
