(function () {
  var root = document.documentElement;

  // ---- Theme toggle ----
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('zt-theme', next); } catch (e) {}
    });
  }

  // ---- Nav border on scroll ----
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Reveal on scroll (stagger siblings) ----
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  if (reduce || params.has('static') || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    items.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('reveal'); });
      var idx = sibs.indexOf(el);
      el.style.setProperty('--d', Math.min(idx, 5) * 70 + (el.classList.contains('reveal--late') ? 120 : 0) + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---- Screenshot gallery tabs ----
  var tabs = [].slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  var img = document.getElementById('galleryImg');
  function select(tab) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); t.tabIndex = t === tab ? 0 : -1; });
    if (img.getAttribute('src') === tab.dataset.src) return;
    img.classList.add('is-fading');
    var pre = new Image();
    pre.onload = function () {
      setTimeout(function () {
        img.src = tab.dataset.src;
        img.alt = '橦云手帐截图：' + tab.dataset.alt;
        img.classList.remove('is-fading');
      }, reduce ? 0 : 160);
    };
    pre.src = tab.dataset.src;
  }
  tabs.forEach(function (tab, i) {
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); select(n);
    });
  });
})();
