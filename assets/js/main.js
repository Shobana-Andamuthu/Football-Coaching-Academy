(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const root = document.documentElement;
  const apply = () => { root.dataset.theme = get('theme') || 'light'; root.dir = get('dir') || 'ltr'; };
  apply();
  const I = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    moon: I('<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8z"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    swap: I('<path d="M4 8h13M14 5l3 3-3 3"/><path d="M20 16H7M10 13l-3 3 3 3"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'), close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    pin: I('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'), clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    ig: I('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>'),
    fb: I('<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
    yt: I('<rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="M10 9.5l5 2.5-5 2.5z"/>'),
    wa: I('<path d="M3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>'),
    eye: I('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')
  };
  const EMBLEM = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3 56 11v20c0 15-10 26-24 30C18 57 8 46 8 31V11z" fill="#0B1F3A" stroke="#C6F432" stroke-width="2"/><circle cx="32" cy="30" r="14" fill="#C6F432"/><path d="m32 21 7 5-3 8h-8l-3-8z" fill="#0B1F3A"/><path d="M32 16v5M39 26l5-2M36 34l3 5M28 34l-3 5M25 26l-5-2" stroke="#0B1F3A" stroke-width="2" stroke-linecap="round"/></svg>';
  const logo = href => `<a class="logo" href="${href}" aria-label="Kickstart Football Academy home">${EMBLEM}<span class="lt"><b>KICKSTART</b><small>Football Academy</small></span></a>`;
  const labelToggles = () => {
    const t = $('#theme'), d = $('#dir'), dk = root.dataset.theme === 'dark';
    if (t) { t.innerHTML = dk ? ICON.sun : ICON.moon; t.setAttribute('aria-label', dk ? 'Switch to light mode' : 'Switch to dark mode'); }
    if (d) { d.innerHTML = ICON.swap; d.setAttribute('aria-label', root.dir === 'rtl' ? 'Switch to left-to-right' : 'Switch to right-to-left'); }
  };
  const bindToggles = () => {
    const t = $('#theme'), d = $('#dir');
    if (t) t.onclick = () => { set('theme', root.dataset.theme === 'dark' ? 'light' : 'dark'); apply(); labelToggles(); };
    if (d) d.onclick = () => { set('dir', root.dir === 'rtl' ? 'ltr' : 'rtl'); apply(); labelToggles(); };
    labelToggles();
  };
  window.KFA = { $, $$, get, set, I, ICON, EMBLEM, logo, bindToggles, labelToggles };
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page, layout = document.body.dataset.layout || 'site';
    const tg = '<button class="icon-btn" id="theme" title="Light / dark"></button><button class="icon-btn" id="dir" title="Text direction"></button>';
    if (layout === 'site') {
      const L = (h, k, t) => `<li><a href="${h}" class="${page === k ? 'on' : ''}" ${page === k ? 'aria-current="page"' : ''}>${t}</a></li>`;
      const homeOn = page === 'home1' || page === 'home2';
      $('#site-nav').innerHTML = `<nav class="nav" aria-label="Main"><div class="wrap">${logo('index.html')}
        <button class="icon-btn burger" id="burger" aria-label="Toggle menu" aria-expanded="false">${ICON.menu.replace('<svg','<svg class="m"')}${ICON.close.replace('<svg','<svg class="x"')}</button>
        <div class="panel" id="panel"><ul class="links"><li class="dd" id="dd"><button class="dd-btn ${homeOn ? 'on' : ''}" aria-expanded="false">Home <span aria-hidden="true">▾</span></button>
        <ul class="dd-menu"><li><a href="index.html" class="${page === 'home1' ? 'on' : ''}">Home 1<small>Team highlights</small></a></li><li><a href="home-2.html" class="${page === 'home2' ? 'on' : ''}">Home 2<small>Age finder</small></a></li></ul></li>
        ${L('about.html', 'about', 'About')}${L('programs.html', 'programs', 'Programs')}${L('coaches.html', 'coaches', 'Coaches')}${L('contact.html', 'contact', 'Contact')}${L('dashboard.html', 'dashboard', 'Dashboard')}</ul>
        <div class="actions">${tg}<a class="btn" href="login.html">Login</a><a class="btn btn-p" href="contact.html#trial">Book a Trial</a></div></div></div></nav>`;
      const soc = (l, i) => `<a href="#" aria-label="${l}">${ICON[i]}</a>`;
      $('#site-footer').innerHTML = `<footer class="foot"><div class="wrap"><div class="cols">
        <div>${logo('index.html')}<p>Professional football coaching for children and teens aged 4 to 16 in Chennai.</p><div class="soc">${soc('Instagram', 'ig')}${soc('Facebook', 'fb')}${soc('YouTube', 'yt')}${soc('WhatsApp', 'wa')}</div></div>
        <div><h4>Pages</h4><ul><li><a href="index.html">Home 1</a></li><li><a href="home-2.html">Home 2</a></li><li><a href="about.html">About</a></li><li><a href="programs.html">Programs</a></li><li><a href="coaches.html">Coaches</a></li><li><a href="contact.html">Contact</a></li><li><a href="login.html">Parent login</a></li></ul></div>
        <div><h4>Contact</h4><ul class="ct"><li>${ICON.pin}<span>Kickstart Arena, 14 Sports Complex Road, Nungambakkam, Chennai 600034</span></li><li>${ICON.phone}<a href="tel:+914455502200">+91 44 5550 2200</a></li><li>${ICON.mail}<a href="mailto:play@kickstart-academy.example">play@kickstart-academy.example</a></li><li>${ICON.clock}<span>Mon–Sat, 4 PM – 8 PM · Sat–Sun, 7 AM – 12 PM</span></li></ul></div>
        <div><h4>Trial day dates</h4><p>Free trial sessions run every month. Leave your email and we send the next date.</p><form class="news" id="news" novalidate><input id="news-e" type="email" placeholder="Email address" aria-label="Email address"><button class="btn btn-p" type="submit">Notify me</button></form><div class="news-m" id="news-m" role="status"></div></div>
        </div><div class="copy">© 2026 Kickstart Football Academy. All rights reserved. · Privacy · Terms · Safeguarding policy</div></div></footer><button class="top" id="top" aria-label="Back to top">↑</button>`;
      const panel = $('#panel'), burger = $('#burger'), dd = $('#dd');
      const closeDD = () => { dd.classList.remove('open'); $('.dd-btn', dd).setAttribute('aria-expanded', 'false'); };
      const closeMenu = () => { panel.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); closeDD(); };
      burger.onclick = () => { const o = panel.classList.toggle('open'); burger.setAttribute('aria-expanded', o); if (!o) closeDD(); };
      $('.dd-btn', dd).onclick = e => { e.stopPropagation(); const o = dd.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
      panel.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
      document.addEventListener('click', e => { if (!dd.contains(e.target)) closeDD(); if (!e.target.closest('.nav')) closeMenu(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
      const top = $('#top'); addEventListener('scroll', () => top.classList.toggle('show', scrollY > 400), { passive: true }); top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
      const nf = $('#news'); nf.addEventListener('submit', e => { e.preventDefault(); const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('#news-e').value.trim()); $('#news-m').textContent = ok ? 'Demo only: no backend is connected, so nothing was sent.' : 'Please enter a valid email address.'; });
      bindToggles();
    } else if (layout === 'login') {
      const alt = page === 'signup' ? '<a class="btn" href="login.html">Sign in</a>' : '<a class="btn btn-p" href="signup.html">Create account</a>';
      $('#auth-nav').innerHTML = `<div class="auth-nav"><div class="wrap">${logo('index.html')}<div class="actions">${tg}${alt}</div></div></div>`;
      bindToggles();
    }
    // accordion: one open at a time
    $$('details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('details').forEach(o => { if (o !== d && o.parentElement === d.parentElement) o.open = false; }); }));
    // carousel: arrows, dots, swipe, autoplay (pauses on hover/focus)
    $$('.tcar').forEach(c => {
      const it = $$('.ts', c), dots = $('.tdots', c); let i = 0, timer = null;
      const show = (n, dir) => {
        i = (n + it.length) % it.length; c.classList.toggle('back', dir === -1);
        it.forEach((x, k) => x.classList.toggle('on', k === i));
        if (dots) $$('button', dots).forEach((b, k) => b.setAttribute('aria-selected', k === i));
      };
      if (dots) { it.forEach((_, k) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Testimonial ' + (k + 1)); b.onclick = () => { show(k, k < i ? -1 : 1); restart(); }; dots.appendChild(b); }); }
      const next = () => show(i + 1, 1), prev = () => show(i - 1, -1);
      const stop = () => { clearInterval(timer); timer = null; };
      const restart = () => { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, 7000); };
      $('.tprev', c).onclick = () => { prev(); restart(); }; $('.tnext', c).onclick = () => { next(); restart(); };
      c.addEventListener('mouseenter', stop); c.addEventListener('mouseleave', restart); c.addEventListener('focusin', stop); c.addEventListener('focusout', restart);
      c.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { (root.dir === 'rtl' ? next : prev)(); restart(); } if (e.key === 'ArrowRight') { (root.dir === 'rtl' ? prev : next)(); restart(); } });
      let x0 = null; c.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      c.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); restart(); } });
      show(0, 1); restart();
    });
    // v3: scroll progress bar, nav shadow, auto-reveal on every page, animated counters
    if (layout === 'site') {
      const sp = document.createElement('div'); sp.id = 'sp'; document.body.appendChild(sp);
      const navEl = $('.nav');
      const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; sp.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; if (navEl) navEl.classList.toggle('scrolled', scrollY > 8); };
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      const skip = '.hero,.phero,.h2hero,#site-nav,.foot,#loader';
      $$('.head,.phil-intro,.phil-list li,.card,.pc,.hl,.cc,.crow,.fx,.stat,.stepper>div,.gal img,.tl li,.b,.mini>div,.band .wrap>div,details,.cta,.form,.mock,.mapbox>*,.two>*,.split>*').forEach(el => {
        if (el.closest(skip) || el.classList.contains('rv') || (el.parentElement && el.parentElement.closest('.rv'))) return;
        const sibs = [...el.parentElement.children], i = sibs.indexOf(el);
        el.classList.add('rv'); el.style.setProperty('--d', (Math.min(i, 5) * 0.09) + 's');
        if (el.parentElement.classList.contains('split')) el.classList.add((i === 0) !== el.parentElement.classList.contains('rev') ? 'rv-l' : 'rv-r');
        else if (el.matches('.stat,.gal img,.b,.mini>div,.band .wrap>div')) el.classList.add('rv-z');
      });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
        const cio = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; cio.unobserve(en.target); const el = en.target, m = el.dataset.v.match(/^([\d,]+)(.*)$/), to = +m[1].replace(/,/g, ''), suf = m[2], t0 = performance.now(), d = 1500; const f = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('en-US') + (p === 1 ? suf : ''); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }), { threshold: .4 });
        $$('.stats b,.band b,.stat b').forEach(el => { const v = el.textContent.trim(); if (el.dataset.count || !/^[\d,]+[+%]?$/.test(v)) return; el.dataset.v = v; el.textContent = '0'; cio.observe(el); });
      }
    }
    // scroll reveal + count-up numbers
    const rv = $$('.rv'), cnt = $$('[data-count]');
    if ('IntersectionObserver' in window && (rv.length || cnt.length)) {
      root.classList.add('rv-ready');
      const run = el => { const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), d = 1400; if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to + suf; return; } const f = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + (p === 1 ? suf : ''); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); $$('[data-count]', en.target).forEach(run); io.unobserve(en.target); } }), { threshold: .15 });
      rv.forEach(e => io.observe(e));
    }
    // age finder
    const mt = $('#matcher');
    if (mt) { const R = { a: 'Little Kickers (ages 4–6): Sat & Sun 8:00–8:45 AM, ₹3,000 per month.', b: 'Juniors (ages 7–9): Tue & Thu 4:30–5:30 PM, ₹3,800 per month.', c: 'Academy (ages 10–12): Tue & Thu 5:30–7:00 PM plus a weekend match, ₹4,800 per month.', d: 'Elite (ages 13–16): Mon, Wed, Fri 6:00–7:30 PM plus league matches, ₹6,000 per month.' };
      mt.addEventListener('submit', e => { e.preventDefault(); const a = $('#m-age').value, g = $('#m-goal').value; $('#m-out').textContent = !a ? 'Choose an age group first.' : 'Suggested: ' + R[a] + (g === 'gk' ? ' Add goalkeeper coaching on Fridays.' : g === 'comp' ? ' Includes match squad selection.' : ''); }); }
    // trial form
    const tf = $('#trial');
    if (tf) tf.addEventListener('submit', e => {
      e.preventDefault(); let ok = true;
      const chk = (id, test, m) => { const el = $('#' + id), er = $('#' + id + '-e'), bad = !test(el.value.trim()); el.classList.toggle('bad', bad); er.textContent = bad ? m : ''; if (bad) ok = false; };
      chk('t-name', v => v.length > 1, 'Please enter your name.'); chk('t-email', v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Enter a valid email.');
      chk('t-phone', v => /^[0-9+\s-]{8,15}$/.test(v), 'Enter a valid phone number.'); chk('t-age', v => v >= 4 && v <= 16, "Child's age must be 4 to 16."); chk('t-prog', v => v !== '', 'Select a program.');
      const m = $('#t-msg'); m.classList.add('show'); m.textContent = ok ? 'Demo only: your details are valid, but no backend is connected so nothing was sent.' : 'Please fix the highlighted fields.';
    });
    // loader
    const LD = $('#loader');
    if (LD) { const t0 = performance.now(); let gone = false; const done = () => { if (gone) return; gone = true; setTimeout(() => { LD.classList.add('hide'); setTimeout(() => LD.remove(), 600); }, Math.max(0, 800 - (performance.now() - t0))); };
      if (document.readyState === 'complete') done(); else addEventListener('load', done); setTimeout(done, 3500); }
  });
})();
