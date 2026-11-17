/* Menu mobile + lightbox per le gallerie */
(function () {
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) {
    var set = function (o) {
      n.classList.toggle('open', o);
      b.setAttribute('aria-expanded', o ? 'true' : 'false');
      b.setAttribute('aria-label', o ? 'Chiudi il menu' : 'Apri il menu');
    };
    b.addEventListener('click', function () { set(!n.classList.contains('open')); });
    n.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  var items = [].slice.call(document.querySelectorAll('[data-full]'));
  var lb = document.getElementById('lb');
  if (!items.length || !lb) return;
  var im = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), idx = 0, last = null;
  function show(i) {
    idx = (i + items.length) % items.length;
    var el = items[idx], t = el.querySelector('img');
    im.classList.remove('sw'); void im.offsetWidth; im.classList.add('sw');
    im.src = el.getAttribute('data-full');
    im.alt = t ? t.alt : '';
    cap.textContent = el.getAttribute('data-cap') || '';
  }
  function open(i) {
    last = document.activeElement; show(i); lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.hidden = true; im.removeAttribute('src');
    document.body.style.overflow = '';
    if (last && last.focus) last.focus();
  }
  items.forEach(function (el, i) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();


/* Animazioni: hero, scorrimento, comparsa degli elementi */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.header');
  var hero = document.querySelector('.hero');
  var stage = hero && hero.querySelector('.hero-stage');
  var wide = function () { return window.innerWidth > 650; };

  /* ---- slideshow dell'hero ---- */
  if (hero) {
    var slides = [].slice.call(hero.querySelectorAll('.hs'));
    var dots = [].slice.call(hero.querySelectorAll('.hd'));
    var meta = hero.querySelector('.hero-meta');
    var nEl = hero.querySelector('.hm-n'), tEl = hero.querySelector('.hm-t a'), sEl = hero.querySelector('.hm-s');
    var cur = 0, timer = null;
    var go = function (i) {
      i = (i + slides.length) % slides.length;
      if (i === cur) return;
      slides.forEach(function (s, k) { if (k !== cur) s.classList.remove('prev'); });
      slides[cur].classList.remove('on'); slides[cur].classList.add('prev');
      slides[i].classList.add('on');
      var old = slides[cur];
      clearTimeout(timer);
      timer = setTimeout(function () { old.classList.remove('prev'); }, 1700);
      dots.forEach(function (d, k) {
        d.classList.toggle('on', k === i);
        if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      cur = i;
      nEl.textContent = '0' + (i + 1);
      tEl.textContent = slides[i].getAttribute('data-t');
      tEl.setAttribute('href', slides[i].getAttribute('data-h'));
      sEl.textContent = slides[i].getAttribute('data-s');
      meta.classList.remove('sw'); void meta.offsetWidth; meta.classList.add('sw');
    };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    /* l'avanzamento è guidato dalla barra del puntino attivo */
    hero.addEventListener('animationend', function (e) {
      if (e.animationName === 'dotfill') go(cur + 1);
    });
    ['.hero-stage', '.hero-ui'].forEach(function (q) {
      var el = hero.querySelector(q);
      if (!el) return;
      el.addEventListener('mouseenter', function () { hero.classList.add('hov'); });
      el.addEventListener('mouseleave', function () { hero.classList.remove('hov'); });
    });
    hero.addEventListener('focusin', function () { hero.classList.add('hov'); });
    hero.addEventListener('focusout', function () { hero.classList.remove('hov'); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        hero.classList.toggle('off', !en[0].isIntersecting);
      }, { threshold: 0.15 }).observe(hero);
    }
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---- scorrimento: header, barra di avanzamento, parallasse ---- */
  var ticking = false, mx = 0, my = 0, cx = 0, cy = 0, py = 0, cpy = 0, fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var frame = function () {
    ticking = false;
    var y = window.pageYOffset || 0, h = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      header.classList.toggle('scrolled', y > 40);
      header.style.setProperty('--sp', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
    }
    if (stage && !reduce && wide()) {
      py = Math.min(60, y * 0.16);
      cpy += (py - cpy) * 0.2; cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;
      stage.style.setProperty('--py', cpy.toFixed(2) + 'px');
      stage.style.setProperty('--mx', cx.toFixed(2) + 'px');
      stage.style.setProperty('--my', cy.toFixed(2) + 'px');
      if (Math.abs(py - cpy) > 0.1 || Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) request();
    }
  };
  var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (hero && fine && !reduce) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = -((e.clientX - r.left) / r.width - 0.5) * 22;
      my = -((e.clientY - r.top) / r.height - 0.5) * 14;
      request();
    });
    hero.addEventListener('mouseleave', function () { mx = 0; my = 0; request(); });
  }
  request();

  /* ---- nastro: accelera con lo scorrimento ---- */
  var track = document.querySelector('.ticker-track');
  if (track && !reduce && track.getAnimations) {
    var ly = window.pageYOffset || 0, rate = 1, run = false;
    var spin = function () {
      var an = track.getAnimations()[0];
      rate += (1 - rate) * 0.06;
      if (an) an.playbackRate = rate;
      if (Math.abs(rate - 1) > 0.02) requestAnimationFrame(spin); else { run = false; if (an) an.playbackRate = 1; }
    };
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || 0, d = Math.abs(y - ly); ly = y;
      rate = Math.min(9, rate + d * 0.05);
      if (!run) { run = true; requestAnimationFrame(spin); }
    }, { passive: true });
  }

  /* ---- cursore «Guarda» sulle opere e inclinazione delle schede ---- */
  if (fine && !reduce) {
    var works = document.querySelectorAll('[data-full]');
    if (works.length) {
      var c = document.createElement('div');
      c.className = 'cur'; c.setAttribute('aria-hidden', 'true'); c.textContent = 'Guarda';
      document.body.appendChild(c);
      document.documentElement.classList.add('has-cur');
      var over = false;
      document.addEventListener('mousemove', function (e) {
        c.style.setProperty('--cx', e.clientX + 'px'); c.style.setProperty('--cy', e.clientY + 'px');
        var o = !!(e.target.closest && e.target.closest('[data-full]'));
        if (o !== over) { over = o; c.classList.toggle('mv', false); c.style.setProperty('--cs', o ? 1 : 0); if (o) setTimeout(function () { if (over) c.classList.add('mv'); }, 360); }
      }, { passive: true });
      document.addEventListener('scroll', function () { if (over) { over = false; c.classList.remove('mv'); c.style.setProperty('--cs', 0); } }, { passive: true });
    }
    [].forEach.call(document.querySelectorAll('.tile'), function (t) {
      var im = t.querySelector('.im');
      if (!im) return;
      t.addEventListener('mousemove', function (e) {
        var r = im.getBoundingClientRect();
        im.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + 'deg');
        im.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 7).toFixed(2) + 'deg');
      });
      t.addEventListener('mouseleave', function () { im.style.setProperty('--rx', '0deg'); im.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---- comparsa degli elementi ---- */
  if (reduce || !('IntersectionObserver' in window)) return;
  var sel = '.eyebrow, .h2, .sh, .prose > *, .tile, .m, .band, .card, .tl li, .facts > div, .quote, .fig, ' +
            '.contact-grid .item, .faq-list > *, .pause .container > *, .cta .container > *, .banner';
  var vh = window.innerHeight, list = [];
  [].forEach.call(document.querySelectorAll('main ' + sel), function (el) {
    if (el.closest('.hero, .phero, .sticky')) return;
    if (el.parentElement && el.parentElement.closest('.rv')) return;
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    el.classList.add('rv'); list.push(el);
  });
  /* titoli: comparsa parola per parola */
  var wrapWords = function (h) {
    var i = 0, nodes = [], tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null), n;
    while ((n = tw.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      var parts = t.nodeValue.split(/(\s+)/), f = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'), s = document.createElement('span');
        w.className = 'w'; s.textContent = p; s.style.setProperty('--wi', i++); w.appendChild(s); f.appendChild(w);
      });
      t.parentNode.replaceChild(f, t);
    });
  };
  list.forEach(function (el) {
    var h = el.matches('h2') ? el : (el.matches('.sh') ? el.querySelector('h2') : null);
    if (h) wrapWords(h);
  });
  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.style.setProperty('--rd', (Math.min(n, 5) * 0.11).toFixed(2) + 's');
      n++;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  list.forEach(function (el) { io.observe(el); });
})();
