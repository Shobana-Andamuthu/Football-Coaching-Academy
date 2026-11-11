(function () {
  const K = window.KFA, { $, $$, I, ICON } = K;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PROG = [
    { k: 'lk', name: 'Little Kickers', lo: 4, hi: 6, fee: 3000, days: [6, 0], when: 'Sat & Sun 8:00–8:45 AM', coach: 'Coach Anita' },
    { k: 'jr', name: 'Juniors', lo: 7, hi: 9, fee: 3800, days: [2, 4], when: 'Tue & Thu 4:30–5:30 PM', coach: 'Coach Karthik' },
    { k: 'ac', name: 'Academy', lo: 10, hi: 12, fee: 4800, days: [2, 4], when: 'Tue & Thu 5:30–7:00 PM', coach: 'Coach Priya' },
    { k: 'el', name: 'Elite', lo: 13, hi: 16, fee: 6000, days: [1, 3, 5], when: 'Mon, Wed, Fri 6:00–7:30 PM', coach: 'Coach Vikram' }];
  const progFor = age => PROG.find(p => age >= p.lo && age <= p.hi);
  const fmt = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  // ---------- shared auth helpers (front-end only: state lives in this browser's localStorage) ----------
  const AKEY = 'kfa_account', SKEY = 'kfa_session', PKEY = 'kfa_profile';
  const jget = (k, d) => { try { return JSON.parse(K.get(k)) || d; } catch (e) { return d; } };
  const mailOk = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  // ---------- login + create account ----------
  if (document.body.dataset.layout === 'login') {
    const page = document.body.dataset.page, form = $('#login') || $('#signup'), msg = $('#l-msg');
    const say = (t) => { msg.className = 'msg show'; msg.textContent = t; };
    $$('.pw').forEach(w => { const bt = $('.pw-toggle', w), inp = $('input', w); bt.innerHTML = ICON.eye; bt.onclick = () => { const sh = inp.type === 'password'; inp.type = sh ? 'text' : 'password'; bt.setAttribute('aria-label', sh ? 'Hide password' : 'Show password'); }; });
    let was = null; try { was = sessionStorage.getItem('kfa_out'); sessionStorage.removeItem('kfa_out'); } catch (e) {}
    if (was && page === 'login') say('You have been logged out. See you at the next match day!');
    // shared field validator: marks the field, shakes it, shows the message
    let okAll = true;
    const chk = (id, bad, m) => { const el = $('#' + id), f = el.closest('.field'); el.classList.toggle('bad', bad); $('#' + id + '-e').textContent = bad ? m : ''; if (bad) { okAll = false; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); } };
    $$('.field input').forEach(i => i.addEventListener('input', () => { i.classList.remove('bad'); const er = $('#' + i.id + '-e'); if (er) er.textContent = ''; }));
    const enter = (acct, btn, fresh) => { K.set(AKEY, JSON.stringify(acct)); K.set(SKEY, '1'); if (fresh) K.set('kfa_children', '[]'); btn.classList.add('loading'); return new Promise(r => setTimeout(r, 900)); };
    // Social sign-in: replace this handler with your OAuth flow (Google / Facebook / Apple).
    $$('[data-social]').forEach(bt => bt.addEventListener('click', () => {
      const prov = bt.dataset.social; say('Connecting to ' + prov + '…');
      enter(jget(AKEY, null) || { name: 'Priya Sharma', email: 'priya.sharma@example.com', via: prov }, bt, false).then(() => { location.href = 'dashboard.html'; });
    }));
    // animated hop between sign in and create account
    $$('[data-go]').forEach(l => l.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); $('.auth-form').classList.add('leaving'); setTimeout(() => { location.href = l.href; }, 260); }));
    if (page === 'login') {
      $('#forgot').onclick = e => { e.preventDefault(); const v = $('#email').value.trim(); if (!mailOk(v)) { okAll = true; chk('email', true, 'Enter your email first, then choose Forgot password.'); $('#email').focus(); return; } say('If an account exists for ' + v + ', a password reset link is on its way.'); };
      form.addEventListener('submit', e => {
        e.preventDefault(); okAll = true; const em = $('#email').value.trim();
        chk('email', !mailOk(em), 'Enter a valid email address.'); chk('password', $('#password').value.length < 6, 'Password must be at least 6 characters.');
        if (!okAll) { say('Please fix the highlighted fields.'); return; }
        msg.className = 'msg'; const saved = jget(AKEY, null);
        enter(saved && String(saved.email).toLowerCase() === em.toLowerCase() ? saved : { name: 'Priya Sharma', email: em }, $('.btn-go', form), false).then(() => { location.href = 'dashboard.html'; });
      });
    } else {
      const pass = $('#s-pass'), meter = $('#meter'), ml = $('#mlabel');
      const score = v => { let n = 0; if (v.length >= 8) n++; if (/[a-z]/.test(v) && /[A-Z]/.test(v)) n++; if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) n++; return v ? Math.max(1, n) : 0; };
      pass.addEventListener('input', () => { const n = score(pass.value); meter.dataset.s = n; ml.textContent = ['', 'Weak: add length, numbers or symbols', 'Fair: getting there', 'Good password', 'Strong password'][n]; });
      form.addEventListener('submit', e => {
        e.preventDefault(); okAll = true; const v = id => $('#' + id).value.trim(), pw = pass.value;
        chk('s-name', v('s-name').length < 2, 'Please enter your full name.'); chk('s-email', !mailOk(v('s-email')), 'Enter a valid email address.');
        chk('s-phone', !/^[0-9+\s-]{8,15}$/.test(v('s-phone')), 'Enter a valid phone number.');
        chk('s-pass', pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw), 'Use at least 8 characters with a letter and a number.');
        chk('s-pass2', $('#s-pass2').value !== pw || !pw, 'Passwords do not match.');
        const ok = $('#s-ok'); $('#s-ok-e').textContent = ok.checked ? '' : 'Please accept to continue.'; if (!ok.checked) okAll = false;
        if (!okAll) { say('Please fix the highlighted fields.'); return; }
        msg.className = 'msg';
        enter({ name: v('s-name'), email: v('s-email'), phone: v('s-phone'), joined: new Date().toISOString() }, $('.btn-go', form), true).then(() => {
          try { localStorage.removeItem(PKEY); } catch (er) {}
          $('#su-box').classList.add('done'); $('#su-ok').classList.add('show'); setTimeout(() => { location.href = 'dashboard.html'; }, 2400);
        });
      });
    }
    return;
  }
  if (document.body.dataset.layout !== 'dash') return;
  // ---------- dashboard ----------
  const KEY = 'kfa_children';
  const seed = [{ id: 1, name: 'Aarav Sharma', age: 10, pos: 'Midfielder', seed: true, status: 'Active' }, { id: 2, name: 'Meera Sharma', age: 7, pos: 'Forward', seed: true, status: 'Active' }];
  let kids; try { kids = JSON.parse(K.get(KEY)) || seed; } catch (e) { kids = seed; }
  const save = () => K.set(KEY, JSON.stringify(kids));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sessions = kid => {
    if (!kid.seed) return []; const p = progFor(kid.age), out = [], pat = 'PPPLPPAPPPLP'; let d = new Date(today), n = 0, i = (kid.id * 3) % 12;
    while (out.length < 12 && n++ < 90) { d = new Date(d.getTime() - 864e5); if (p.days.includes(d.getDay())) { const c = pat[i++ % 12]; out.push({ date: new Date(d), status: c === 'P' ? 'Present' : c === 'L' ? 'Late' : 'Absent', type: 'Training' }); } }
    return out;
  };
  const rate = s => s.length ? Math.round(100 * s.filter(x => x.status !== 'Absent').length / s.length) : null;
  const opp = ['Chennai Lions', 'Adyar Strikers', 'Marina FC Juniors', 'Velachery United', 'Anna Nagar Rovers', 'Egmore Eagles', 'T Nagar Titans', 'Besant Nagar FC'];
  const fixtures = prog => {
    const base = PROG.indexOf(prog), out = [];
    for (let i = 0; i < 4; i++) { const d = new Date(today.getTime() + (3 + i * 7 + base) * 864e5); out.push({ date: d, prog, opp: opp[(base + i) % 8], home: i % 2 === 0, time: ['9:00 AM', '4:30 PM', '10:30 AM', '5:00 PM'][i], up: true }); }
    for (let i = 0; i < 3; i++) { const d = new Date(today.getTime() - (4 + i * 7 + base) * 864e5), g = [[3, 1], [2, 2], [1, 0]][i]; out.push({ date: d, prog, opp: opp[(base + i + 4) % 8], home: i % 2 === 1, up: false, res: g[0] > g[1] ? 'Won' : g[0] === g[1] ? 'Draw' : 'Lost', score: g[0] + '–' + g[1] }); }
    return out;
  };
  const venue = h => h ? 'Kickstart Arena, Nungambakkam' : 'Away ground';
  const NAV = [['overview', 'Overview', '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'], ['children', 'My Children', '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M17 5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6"/>'], ['enroll', 'Enroll a Child', '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'], ['attendance', 'Attendance', '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M8 14l3 3 5-5"/>'], ['matches', 'Match Schedule', '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z"/>']];
  const OUT = '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10"/>';
  const prof = () => Object.assign({ name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98765 43210', city: 'Chennai', address: '', ecName: '', ecPhone: '', photo: '', prefs: { match: true, attend: true, news: false } }, jget(AKEY, {}), jget(PKEY, {}));
  const ini = n => String(n).split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'P';
  const avIn = p => p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(ini(p.name));
  document.body.innerHTML = `<header class="dh">${K.logo('index.html')}<div class="dh-r"><button class="icon-btn" id="theme"></button><button class="icon-btn" id="dir"></button><a class="user" id="hdr-user" href="#profile" title="My profile"></a><a class="dh-out" href="login.html" data-logout aria-label="Log out" title="Log out">${I(OUT)}<span>Logout</span></a></div></header>
  <div class="dash"><nav class="sb" aria-label="Dashboard">${NAV.map(n => `<a href="#${n[0]}" data-nav="${n[0]}">${I(n[2])}<span>${n[1]}</span></a>`).join('')}<div class="sb-foot"><a class="sb-user" href="#profile" data-nav="profile" aria-label="My profile"><span class="av av-me"></span><span class="sb-un"><b id="sb-nm"></b><small id="sb-em"></small></span></a><a class="sb-out" href="login.html" data-logout>${I(OUT)}<span>Log out</span></a></div></nav>
  <main class="dm"><section class="pn" id="p-overview"></section><section class="pn" id="p-children"></section><section class="pn" id="p-enroll"></section><section class="pn" id="p-attendance"></section><section class="pn" id="p-matches"></section><section class="pn" id="p-profile"></section></main></div>`;
  const paintUser = () => { const p = prof(); $('#hdr-user').innerHTML = `<span class="av">${avIn(p)}</span><span class="nm">${esc(p.name)}</span>`; $('#hdr-user').setAttribute('aria-label', 'My profile: ' + p.name); $$('.av-me').forEach(a => { a.innerHTML = avIn(p); }); const sn = $('#sb-nm'); if (sn) { sn.textContent = p.name; $('#sb-em').textContent = p.email; } };
  paintUser();
  // log out: end the session and return to the login page
  document.addEventListener('click', e => { const a = e.target.closest('[data-logout]'); if (!a) return; e.preventDefault(); try { localStorage.removeItem(SKEY); sessionStorage.setItem('kfa_out', '1'); } catch (er) {} document.body.style.transition = 'opacity .25s'; document.body.style.opacity = '0'; setTimeout(() => { location.href = 'login.html'; }, 220); });
  K.bindToggles();
  const head = (t, extra = '') => `<div class="dt-h"><h1>${t}</h1>${extra}</div>`;
  const allMatches = () => kids.flatMap(k => fixtures(progFor(k.age)).map(m => ({ ...m, kid: k })));
  // ---------- chart helpers (inline SVG + CSS only, no libraries) ----------
  const SK = ['Dribbling', 'Passing', 'Shooting', 'Defending', 'Stamina', 'Teamwork'];
  const skills = k => SK.map((n, i) => ({ n, v: 52 + ((k.id * 7 + i * 13 + k.age * 5) % 40) }));
  const first = n => String(n).split(' ')[0];
  const short = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  let uid = 0;
  const donut = (parts, mid, sub) => {
    const tot = parts.reduce((a, p) => a + p.v, 0), r = 52, C = 2 * Math.PI * r; let off = 0;
    const arcs = tot ? parts.filter(p => p.v > 0).map(p => { const len = C * p.v / tot, el = `<circle class="dn-seg" cx="70" cy="70" r="${r}" fill="none" stroke="${p.c}" stroke-width="18" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 70 70)" style="--c:${C.toFixed(2)}"/>`; off += len; return el; }).join('') : '';
    return `<div class="dn-wrap"><svg class="donut" viewBox="0 0 140 140" role="img" aria-label="${esc(sub)} ${esc(mid)}"><circle class="trk" cx="70" cy="70" r="${r}" fill="none" stroke-width="18"/>${arcs}<text class="t1" x="70" y="73">${mid}</text><text class="t2" x="70" y="89">${esc(sub)}</text></svg><div class="legend" style="flex-direction:column">${parts.map(p => `<span><i style="--c:${p.c}"></i>${p.l} <b>${p.v}</b></span>`).join('')}</div></div>`;
  };
  const lineChart = (vals, labels) => {
    if (!vals.length) return '<div class="empty">No sessions in this period.</div>';
    const w = 300, h = 160, px = 30, py = 26, n = vals.length, id = 'lg' + (++uid);
    const x = i => px + (n > 1 ? i * (w - px * 1.4) / (n - 1) : 0), y = v => h - py - v / 100 * (h - py * 2);
    const d = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const grid = [0, 50, 100].map(v => `<line class="grid-l" x1="${px}" x2="${w - px * .4}" y1="${y(v)}" y2="${y(v)}"/><text x="${px - 8}" y="${y(v) + 3}" style="text-anchor:end">${v}</text>`).join('');
    return `<svg class="ln" viewBox="0 0 ${w} ${h}" role="img" aria-label="Attendance trend ${vals.join('%, ')}%"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop class="s1" offset="0"/><stop class="s2" offset="1"/></linearGradient></defs>${grid}<path class="ln-a" style="fill:url(#${id})" d="${d} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)}Z"/><path class="ln-p" pathLength="1000" d="${d}"/>${vals.map((v, i) => `<circle class="ln-d" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4.5" style="animation-delay:${(0.5 + i * 0.14).toFixed(2)}s"/><text class="gv" x="${x(i).toFixed(1)}" y="${(y(v) - 10).toFixed(1)}">${v}</text>`).join('')}${labels.map((l, i) => `<text x="${x(i).toFixed(1)}" y="${h - 6}">${l}</text>`).join('')}</svg>`;
  };
  const radar = series => {
    const n = SK.length, R = 74, c = 110, pt = (i, v) => { const a = (-90 + 360 / n * i) * Math.PI / 180; return [c + R * v / 100 * Math.cos(a), c + R * v / 100 * Math.sin(a)]; }, P = a => a.map(z => z.toFixed(1)).join(',');
    const rings = [25, 50, 75, 100].map(v => `<polygon class="rg" points="${SK.map((_, i) => P(pt(i, v))).join(' ')}"/>`).join('');
    const axes = SK.map((_, i) => { const p = pt(i, 100); return `<line class="ax" x1="${c}" y1="${c}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}"/>`; }).join('');
    const labs = SK.map((s, i) => { const p = pt(i, 124); return `<text x="${p[0].toFixed(1)}" y="${(p[1] + 3).toFixed(1)}">${s}</text>`; }).join('');
    const polys = series.map((s, k) => `<polygon class="rp p${k + 1}" points="${s.vals.map((v, i) => P(pt(i, v))).join(' ')}" fill="${s.c}" fill-opacity=".28" stroke="${s.c}"/>`).join('');
    return `<svg class="rdr" viewBox="-14 -6 248 232" role="img" aria-label="Skill ratings radar chart">${rings}${axes}${polys}${labs}</svg>`;
  };
  const hb = (rows, cls = '') => `<div class="hb ${cls}">${rows.map(r => `<div><div class="r"><span>${r.l}</span><b>${r.t}</b></div><div class="t"><i style="width:${r.v}%"></i></div></div>`).join('')}</div>`;
  const legend = items => `<div class="legend" style="justify-content:center;margin-top:10px">${items.map(i => `<span><i style="--c:${i.c}"></i>${esc(i.l)}</span>`).join('')}</div>`;
  const goalBars = list => { const mx = Math.max(1, ...list.flatMap(m => m.g)); return `<div class="vb">${list.map(m => `<div><div class="pair"><i data-v="${m.g[0]}" style="height:${Math.max(4, m.g[0] / mx * 100)}%"></i><i class="b2" data-v="${m.g[1]}" style="height:${Math.max(4, m.g[1] / mx * 100)}%"></i></div><span title="${esc(m.l)}">${esc(m.l)}</span></div>`).join('')}</div><div class="legend" style="justify-content:center;margin-top:8px"><span><i></i>Scored</span><span><i class="nv" style="--c:var(--navy)"></i>Conceded</span></div>`; };
  const weeklyRate = ss => { const v = [5, 4, 3, 2, 1, 0].map(w => { const x = ss.filter(s => Math.floor((today - s.date) / (7 * 864e5)) === w); return x.length ? Math.round(100 * x.filter(s => s.status !== 'Absent').length / x.length) : null; }); let last = v.find(z => z !== null); return last === undefined ? [] : v.map(z => (z === null ? last : (last = z))); };
  const WL = ['5w ago', '4w ago', '3w ago', '2w ago', 'Last wk', 'This wk'];
  const resultsData = list => { let w = 0, d = 0, l = 0, gf = 0, ga = 0; list.forEach(m => { const g = m.score.split('–').map(Number); gf += g[0]; ga += g[1]; if (m.res === 'Won') w++; else if (m.res === 'Draw') d++; else l++; }); return { w, d, l, gf, ga, n: list.length }; };
  const formChips = list => `<div class="form-chips" aria-label="Recent form">${list.slice(0, 5).map(m => `<span class="fchip ${m.res[0]}" title="${esc(m.res + ' ' + m.score + ' vs ' + m.opp)}">${m.res[0]}</span>`).join('')}</div>`;
  const FIRE = '<svg class="fire" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/></svg>';
  const FI = { ok: '<path d="M5 12l5 5 9-10"/>', ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z"/>', pay: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>', note: '<path d="M5 4h14v12H9l-4 4z"/>' };
  const pastOf = id => allMatches().filter(m => !m.up && (id === undefined || id === 'all' || String(m.kid.id) === String(id))).sort((a, b) => b.date - a.date);
  const nextDue = () => new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const feeOf = k => progFor(k.age).fee;
  function overview() {
    const act = kids.filter(k => k.status === 'Active'), all = act.flatMap(sessions), r = rate(all), last30 = all.filter(s => s.status !== 'Absent' && (today - s.date) / 864e5 <= 30).length;
    const up = allMatches().filter(m => m.up).sort((a, b) => a.date - b.date), nx = up[0];
    const weeks = [5, 4, 3, 2, 1, 0].map(w => all.filter(s => s.status !== 'Absent' && Math.floor((today - s.date) / (7 * 864e5)) === w).length), mx = Math.max(1, ...weeks);
    const cnt = n => all.filter(x => x.status === n).length, past = pastOf().filter(m => m.kid.status === 'Active'), rs = resultsData(past), fees = act.reduce((a, k) => a + feeOf(k), 0);
    const trend = weeklyRate(all), series = act.slice(0, 2).map((k, i) => ({ n: first(k.name), c: ['#9DCB0E', '#3B82F6'][i], vals: skills(k).map(z => z.v) }));
    const wk = Array.from({ length: 7 }, (_, i) => { const d = new Date(today.getTime() + i * 864e5), ev = []; act.forEach(k => { const p = progFor(k.age); if (p.days.includes(d.getDay())) ev.push(`<span class="ev">${esc(first(k.name))}<small>${p.when.replace(/^[^\d]*/, '')}</small></span>`); }); allMatches().filter(m => m.up && m.date.getTime() === d.getTime()).forEach(m => ev.push(`<span class="ev m">${esc(first(m.kid.name))} vs ${esc(m.opp)}<small>Match · ${m.time}</small></span>`)); return `<div class="wk${i === 0 ? ' today' : ''}"><span>${i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}</span><b>${d.getDate()}</b>${ev.join('') || '<em class="none">Rest day</em>'}</div>`; }).join('');
    const feed = []; act.forEach(k => sessions(k).slice(0, 2).forEach(s => feed.push({ d: s.date, c: s.status === 'Present' ? 'ok' : s.status === 'Late' ? 'warn' : 'bad', i: 'ok', t: `<b>${esc(first(k.name))}</b> was marked ${s.status.toLowerCase()} at training` })));
    past.slice(0, 2).forEach(m => feed.push({ d: m.date, c: m.res === 'Won' ? 'ok' : m.res === 'Lost' ? 'bad' : 'warn', i: 'ball', t: `${esc(m.prog.name)} ${m.res.toLowerCase()} ${m.score} vs ${esc(m.opp)}` }));
    if (act[0]) { feed.push({ d: new Date(today.getTime() - 2 * 864e5), c: 'lime', i: 'note', t: `<b>${progFor(act[0].age).coach}</b>: great first touch from ${esc(first(act[0].name))} this week` }); feed.push({ d: new Date(today.getTime() - 3 * 864e5), c: 'ok', i: 'pay', t: `Fee of ₹${fees.toLocaleString('en-IN')} received. Thank you!` }); }
    feed.sort((a, b) => b.d - a.d);
    $('#p-overview').innerHTML = head('Parent dashboard') + `<div class="kpi"><div class="card"><span>Children</span><b data-count="${kids.length}">${kids.length}</b><small>${act.length} active</small></div><div class="card"><span>Attendance rate</span><b ${r === null ? '' : `data-count="${r}" data-suffix="%"`}>${r === null ? '–' : r + '%'}</b><small>Last 12 sessions</small></div><div class="card"><span>Sessions attended</span><b data-count="${last30}">${last30}</b><small>Last 30 days</small></div><div class="card"><span>Upcoming matches</span><b data-count="${up.length}">${up.length}</b><small>Next 4 weeks</small></div></div>
    <div class="dg3"><div class="card"><h3>Next match</h3>${nx ? `<p><b style="color:var(--ink)">${esc(nx.kid.name)}</b> · ${esc(nx.prog.name)}</p><div class="big" style="font-size:2.4rem">${fmt(nx.date)}</div><p>vs ${esc(nx.opp)} · ${nx.time} · ${venue(nx.home)}</p><a class="btn" href="#matches" style="align-self:flex-start;margin-top:8px">Full schedule</a>` : '<p>No matches scheduled yet.</p>'}</div>
    <div class="card"><h3>Attendance <small>last 12 sessions</small></h3>${donut([{ l: 'Present', v: cnt('Present'), c: '#0E7C3A' }, { l: 'Late', v: cnt('Late'), c: '#F5A524' }, { l: 'Absent', v: cnt('Absent'), c: '#E5484D' }], r === null ? '–' : r + '%', 'attended')}</div>
    <div class="card"><h3>Match results <small>season</small></h3>${rs.n ? donut([{ l: 'Won', v: rs.w, c: '#0E7C3A' }, { l: 'Drawn', v: rs.d, c: '#F5A524' }, { l: 'Lost', v: rs.l, c: '#E5484D' }], rs.n, 'played') + `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:6px"><small style="color:var(--muted)">Recent form</small>${formChips(past)}</div>` : '<p>No results yet.</p>'}</div></div>
    <div class="dg"><div class="card"><h3>Sessions attended per week</h3><div class="chart" role="img" aria-label="Sessions attended per week">${weeks.map((n, i) => `<div><em>${n}</em><i style="height:${Math.max(4, Math.round(n / mx * 82))}%"></i><span>${i === 5 ? 'This wk' : (5 - i) + 'w ago'}</span></div>`).join('')}</div></div>
    <div class="card"><h3>Attendance trend <small>% per week</small></h3>${lineChart(trend, WL)}</div></div>
    <div class="dg3"><div class="card"><h3>Skill ratings <small>coach assessed</small></h3>${series.length ? radar(series) + legend(series.map(s => ({ l: s.n, c: s.c }))) : '<p>Ratings appear once a child is active.</p>'}</div>
    <div class="card"><h3>Monthly fees <small>per child</small></h3>${act.length ? hb(act.map(k => ({ l: esc(first(k.name)) + ' · ' + progFor(k.age).name, t: '₹' + feeOf(k).toLocaleString('en-IN'), v: Math.round(feeOf(k) / 6000 * 100) }))) + `<div class="due-box"><small>Next payment due ${fmt(nextDue())}</small><b>₹${fees.toLocaleString('en-IN')}</b></div>` : '<p>No active enrollments.</p>'}</div>
    <div class="card"><h3>Recent activity</h3><ul class="feed">${feed.slice(0, 6).map(f => `<li><span class="fi2 ${f.c}"><svg viewBox="0 0 24 24" aria-hidden="true">${FI[f.i]}</svg></span><p>${f.t}</p><small>${short(f.d)}</small></li>`).join('') || '<li><p>No activity yet.</p></li>'}</ul></div></div>
    <div class="card" style="margin-top:20px"><h3>This week <small>trainings and matches</small></h3><div class="weekstrip">${wk}</div></div>`;
  }
  function children() {
    const act = kids.filter(k => k.status === 'Active');
    $('#p-children').innerHTML = head('My children', '<a class="btn btn-p" href="#enroll">Enroll a child</a>') + (kids.length ? `<div class="dg3">${kids.map(k => { const p = progFor(k.age), s = sessions(k), r = rate(s), sk = skills(k).sort((a, b) => b.v - a.v).slice(0, 3), rs = resultsData(fixtures(p).filter(m => !m.up)); return `<div class="card"><div class="ch"><span class="av">${esc(k.name.split(' ').map(x => x[0]).join('').slice(0, 2))}</span><div><h3>${esc(k.name)}</h3><small>Age ${k.age} · ${esc(k.pos || 'Position TBC')}</small></div></div>
      <div class="chips"><span class="chip">${p.name}</span><span class="chip ${k.status === 'Active' ? 'ok' : 'warn'}">${esc(k.status)}</span></div><p>${p.when}<br>${p.coach}</p>
      <div class="mini-stats"><div><b>${s.length || '–'}</b><span>Sessions</span></div><div><b>${k.status === 'Active' ? rs.n : '–'}</b><span>Matches</span></div><div><b>${k.status === 'Active' ? rs.gf : '–'}</b><span>Team goals</span></div></div>
      ${k.status === 'Active' ? `<div class="skill-t">Top skills</div>${hb(sk.map(z => ({ l: z.n, t: z.v, v: z.v })))}` : ''}
      ${r === null ? '<p>Attendance starts after the first session.</p>' : `<div class="pbar" aria-label="Attendance ${r}%" style="margin-top:8px"><i style="width:${r}%"></i></div><small style="color:var(--muted)">${r}% attendance</small>`}<a class="btn" href="#attendance" data-kid="${k.id}" style="margin-top:6px">View attendance</a></div>`; }).join('')}</div>
      <div class="dg"><div class="card"><h3>Attendance by child <small>last 12 sessions</small></h3>${act.length ? hb(act.map(k => { const r = rate(sessions(k)); return { l: esc(k.name), t: r + '%', v: r }; })) : '<p>No active children yet.</p>'}</div>
      <div class="card"><h3>Skill comparison</h3>${act.length ? radar(act.slice(0, 3).map((k, i) => ({ c: ['#9DCB0E', '#3B82F6', '#F5A524'][i], vals: skills(k).map(z => z.v) }))) + legend(act.slice(0, 3).map((k, i) => ({ l: first(k.name), c: ['#9DCB0E', '#3B82F6', '#F5A524'][i] }))) : '<p>Ratings appear once a child is active.</p>'}</div></div>` : '<div class="empty">No children yet. Enroll your first child to get started.</div>');
  }
  const attCharts = s => {
    if (!s.length) return '';
    const c = n => s.filter(x => x.status === n).length; let st = 0; for (const x of s) { if (x.status === 'Absent') break; st++; }
    const pr = c('Present'), tot = s.length;
    return `<div class="dg3" style="margin-bottom:20px"><div class="card"><h3>Breakdown <small>${tot} sessions</small></h3>${donut([{ l: 'Present', v: pr, c: '#0E7C3A' }, { l: 'Late', v: c('Late'), c: '#F5A524' }, { l: 'Absent', v: c('Absent'), c: '#E5484D' }], rate(s) + '%', 'attended')}</div>
    <div class="card"><h3>Weekly trend <small>% attended</small></h3>${lineChart(weeklyRate(s), WL)}</div>
    <div class="card"><div class="streak">${FIRE}<div class="big">${st}</div><p>sessions in a row without an absence</p></div>${hb([{ l: 'On time', t: Math.round(100 * pr / tot) + '%', v: Math.round(100 * pr / tot) }, { l: 'Late', t: Math.round(100 * c('Late') / tot) + '%', v: Math.round(100 * c('Late') / tot) }, { l: 'Absent', t: Math.round(100 * c('Absent') / tot) + '%', v: Math.round(100 * c('Absent') / tot) }], 'lime')}</div></div>`;
  };
  const matchSummary = id => {
    const past = pastOf(id); if (!past.length) return ''; const rs = resultsData(past), chart = past.slice(0, 6).reverse().map(m => ({ l: m.opp.split(' ')[0], g: m.score.split('–').map(Number) }));
    return `<div class="kpi"><div class="card"><span>Played</span><b data-count="${rs.n}">${rs.n}</b><small>This season</small></div><div class="card"><span>Won</span><b data-count="${rs.w}">${rs.w}</b><small>${rs.d} drawn · ${rs.l} lost</small></div><div class="card"><span>Goals scored</span><b data-count="${rs.gf}">${rs.gf}</b><small>Team total</small></div><div class="card"><span>Goals conceded</span><b data-count="${rs.ga}">${rs.ga}</b><small>Team total</small></div></div>
    <div class="dg" style="margin-bottom:22px"><div class="card"><h3>Results <small>win / draw / loss</small></h3>${donut([{ l: 'Won', v: rs.w, c: '#0E7C3A' }, { l: 'Drawn', v: rs.d, c: '#F5A524' }, { l: 'Lost', v: rs.l, c: '#E5484D' }], Math.round(100 * rs.w / rs.n) + '%', 'win rate')}<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px"><small style="color:var(--muted)">Recent form</small>${formChips(past)}</div></div>
    <div class="card"><h3>Goals per match <small>vs opponent</small></h3>${goalBars(chart)}</div></div>`;
  };
  const enrollExtra = () => $('#p-enroll').insertAdjacentHTML('beforeend', `<div class="dg" style="margin-top:20px"><div class="card"><h3>Monthly fees <small>per program</small></h3>${hb(PROG.map(p => ({ l: `${p.name} · ages ${p.lo}–${p.hi}`, t: '₹' + p.fee.toLocaleString('en-IN'), v: Math.round(p.fee / 6000 * 100) })))}</div>
    <div class="card"><h3>What happens next</h3><ol class="tl" style="margin-top:8px"><li><div><b style="color:var(--ink)">Submit the form</b><p>Tell us about your child, their program and training days.</p></div></li><li><div><b style="color:var(--ink)">We confirm within 2 days</b><p>The academy checks the age group and a place in the squad.</p></div></li><li><div><b style="color:var(--ink)">Turn up for the first session</b><p>Attendance, fees and match days then appear on your dashboard.</p></div></li></ol></div></div>`);
  const profExtra = () => { const p = prof(), fees = kids.filter(k => k.status === 'Active').reduce((a, k) => a + feeOf(k), 0), BD = ['Ever-present', 'Team player', 'Rising star', 'Match-day regular'];
    return `<div class="card"><h3>Membership</h3><div><div class="mem-row"><span>Member since</span><b>${p.joined ? fmt(new Date(p.joined)) : 'Aug 2025'}</b></div><div class="mem-row"><span>Plan</span><b>Family · ${kids.length} ${kids.length === 1 ? 'child' : 'children'}</b></div><div class="mem-row"><span>Monthly fees</span><b>₹${fees.toLocaleString('en-IN')}</b></div><div class="mem-row"><span>Next payment</span><b>${fmt(nextDue())}</b></div></div></div>
    <div class="card"><h3>My children <small>${kids.length}</small></h3><div>${kids.map(k => `<div class="kid-row"><span class="av">${esc(k.name.split(' ').map(x => x[0]).join('').slice(0, 2))}</span><div><b>${esc(k.name)}</b><small>${progFor(k.age).name} · age ${k.age}</small></div><span class="chip ${k.status === 'Active' ? 'ok' : 'warn'}">${k.status === 'Active' ? 'Active' : 'Pending'}</span></div>`).join('') || '<p>No children enrolled yet.</p>'}</div></div>
    <div class="card"><h3>Family badges</h3><div class="badges">${BD.map(b => `<span class="badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/></svg>${b}</span>`).join('')}</div></div>`; };
  const countUp = root => $$('[data-count]', root).forEach(el => { const to = +el.dataset.count, suf = el.dataset.suffix || ''; if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to + suf; return; } const t0 = performance.now(), f = t => { const p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  function enroll() {
    $('#p-enroll').innerHTML = head('Enroll a child') + `<form class="form" id="enf" novalidate><div class="field"><label for="e-name">Child's full name *</label><input id="e-name" autocomplete="off"><span class="err" id="e-name-e"></span></div><div class="field"><label for="e-dob">Date of birth *</label><input id="e-dob" type="date"><span class="err" id="e-dob-e"></span></div>
    <div class="field"><label for="e-prog">Program *</label><select id="e-prog"><option value="">Select a program</option>${PROG.map(p => `<option value="${p.k}">${p.name} (ages ${p.lo}–${p.hi}) · ₹${p.fee.toLocaleString('en-IN')}/month</option>`).join('')}</select><span class="err" id="e-prog-e"></span></div>
    <div class="field"><label for="e-pos">Preferred position</label><select id="e-pos"><option>Not sure yet</option><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></div>
    <div class="field"><label for="e-ph">Emergency contact phone *</label><input id="e-ph" type="tel"><span class="err" id="e-ph-e"></span></div>
    <div class="field"><fieldset><legend>Preferred training days</legend><div class="checks">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<label><input type="checkbox" value="${d}"> ${d}</label>`).join('')}</div></fieldset></div>
    <div class="field full"><label for="e-med">Medical notes or allergies</label><textarea id="e-med"></textarea></div>
    <div class="field full"><label class="agree"><input type="checkbox" id="e-ok"><span>I confirm I am the parent or guardian and agree to the academy's safeguarding and photo policies. *</span></label><span class="err" id="e-ok-e"></span></div>
    <div class="field full"><button class="btn btn-p" type="submit">Submit enrollment</button></div><div class="msg" id="e-msg" role="status"></div></form>`;
    const dob = $('#e-dob'); dob.max = today.toISOString().slice(0, 10);
    dob.onchange = () => { const a = ageOf(dob.value), p = progFor(a); if (p) $('#e-prog').value = p.k; };
    $('#enf').addEventListener('submit', e => {
      e.preventDefault(); let ok = true; const a = ageOf(dob.value);
      const chk = (id, bad, m) => { const el = $('#' + id); el.classList.toggle('bad', bad); $('#' + id + '-e').textContent = bad ? m : ''; if (bad) ok = false; };
      chk('e-name', $('#e-name').value.trim().length < 2, "Enter the child's name."); chk('e-dob', !dob.value || !(a >= 4 && a <= 16), 'Children must be aged 4 to 16.');
      const pv = PROG.find(p => p.k === $('#e-prog').value); chk('e-prog', !pv || (a >= 4 && (a < pv.lo || a > pv.hi)), pv ? `${pv.name} is for ages ${pv.lo}–${pv.hi}.` : 'Select a program.');
      chk('e-ph', !/^[0-9+\s-]{8,15}$/.test($('#e-ph').value.trim()), 'Enter a valid phone number.'); chk('e-ok', !$('#e-ok').checked, 'Please confirm to continue.');
      const m = $('#e-msg'); m.classList.add('show');
      if (!ok) { m.textContent = 'Please fix the highlighted fields.'; return; }
      kids.push({ id: Date.now(), name: $('#e-name').value.trim(), age: a, pos: $('#e-pos').value, status: 'Pending confirmation' }); save();
      m.textContent = 'Enrollment submitted. The child now appears under My Children as "Pending confirmation".'; $('#enf').reset(); refresh(['overview', 'children', 'attendance', 'matches', 'profile']);
    });
  }
  const ageOf = v => { if (!v) return NaN; const b = new Date(v), t = new Date(); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
  const kidOpts = sel => kids.map(k => `<option value="${k.id}" ${String(k.id) === String(sel) ? 'selected' : ''}>${esc(k.name)}</option>`).join('');
  function attendance(kidId, range) {
    const el = $('#p-attendance'); if (!kids.length) { el.innerHTML = head('Attendance') + '<div class="empty">Enroll a child to track attendance.</div>'; return; }
    kidId = kidId || el.dataset.kid || kids[0].id; range = range || el.dataset.range || '90'; el.dataset.kid = kidId; el.dataset.range = range;
    const kid = kids.find(k => String(k.id) === String(kidId)) || kids[0]; let s = sessions(kid); if (range !== 'all') s = s.filter(x => (today - x.date) / 864e5 <= +range);
    const c = n => s.filter(x => x.status === n).length, r = rate(s);
    el.innerHTML = head('Attendance') + `<div class="toolbar"><select id="a-kid" aria-label="Child">${kidOpts(kid.id)}</select><select id="a-range" aria-label="Period"><option value="30" ${range === '30' ? 'selected' : ''}>Last 30 days</option><option value="90" ${range === '90' ? 'selected' : ''}>Last 90 days</option><option value="all" ${range === 'all' ? 'selected' : ''}>All sessions</option></select></div>
    ${s.length ? `<div class="kpi"><div class="card"><span>Attendance rate</span><b>${r}%</b></div><div class="card"><span>Present</span><b>${c('Present')}</b></div><div class="card"><span>Late</span><b>${c('Late')}</b></div><div class="card"><span>Absent</span><b>${c('Absent')}</b></div></div>
    ${attCharts(s)}<div class="tbl"><table><thead><tr><th>Date</th><th>Session</th><th>Program</th><th>Status</th></tr></thead><tbody>${s.map(x => `<tr><td data-label="Date">${fmt(x.date)}</td><td data-label="Session">Training</td><td data-label="Program">${progFor(kid.age).name}</td><td data-label="Status"><span class="chip ${x.status === 'Present' ? 'ok' : x.status === 'Late' ? 'warn' : 'bad'}">${x.status}</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${kid.seed ? 'No sessions in this period.' : esc(kid.name) + ' has no sessions yet. Attendance appears after the academy confirms the enrollment and the first session takes place.'}</div>`}`;
    $('#a-kid').onchange = e => attendance(e.target.value, $('#a-range').value); $('#a-range').onchange = e => attendance($('#a-kid').value, e.target.value);
  }
  function matches(kidId, view) {
    const el = $('#p-matches'); if (!kids.length) { el.innerHTML = head('Match schedule') + '<div class="empty">Enroll a child to see match schedules.</div>'; return; }
    kidId = kidId || el.dataset.kid || 'all'; view = view || el.dataset.view || 'up'; el.dataset.kid = kidId; el.dataset.view = view;
    let list = allMatches().filter(m => (view === 'up') === m.up && (kidId === 'all' || String(m.kid.id) === String(kidId))); list.sort((a, b) => view === 'up' ? a.date - b.date : b.date - a.date);
    el.innerHTML = head('Match schedule') + matchSummary(kidId) + `<div class="toolbar"><select id="m-kid" aria-label="Child"><option value="all">All children</option>${kidOpts(kidId)}</select><select id="m-view" aria-label="View"><option value="up" ${view === 'up' ? 'selected' : ''}>Upcoming</option><option value="past" ${view === 'past' ? 'selected' : ''}>Results</option></select></div>` +
      (list.length ? list.map(m => `<div class="fx"><div class="dt"><div><b>${m.date.getDate()}</b><span>${m.date.toLocaleDateString('en-IN', { month: 'short' })}</span></div></div><div><h3>${esc(m.prog.name)} vs ${esc(m.opp)}</h3><p>${esc(m.kid.name)} · ${m.up ? m.time + ' · ' : ''}${venue(m.home)} · ${m.home ? 'Home' : 'Away'}</p></div><span class="chip ${m.up ? '' : m.res === 'Won' ? 'ok' : m.res === 'Lost' ? 'bad' : 'warn'}">${m.up ? 'Upcoming' : m.res + ' ' + m.score}</span></div>`).join('') : '<div class="empty">No matches to show.</div>');
    $('#m-kid').value = kidId; $('#m-kid').onchange = e => matches(e.target.value, $('#m-view').value); $('#m-view').onchange = e => matches($('#m-kid').value, e.target.value);
  }
  function profile() {
    const p = prof(), all = kids.filter(k => k.status === 'Active').flatMap(sessions), r = rate(all), up = allMatches().filter(m => m.up).length;
    const sw = (id, t, d, on) => `<label class="sw" for="${id}"><div><b>${t}</b><small>${d}</small></div><input type="checkbox" id="${id}" ${on ? 'checked' : ''}></label>`;
    $('#p-profile').innerHTML = head('My profile') + `<div class="prof"><div class="prof-col"><div class="card prof-side"><div class="pav"><span class="av av-me">${avIn(p)}</span><label for="p-photo" title="Change photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.8l1.4-2h6.6l1.4 2h1.8A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/></svg><span class="sr">Change photo</span></label><input id="p-photo" type="file" accept="image/*"></div>
      <h2 id="p-nm">${esc(p.name)}</h2><span class="mail" id="p-ml">${esc(p.email)}</span><div class="chips" style="justify-content:center;margin-top:8px"><span class="chip ok">Parent account</span>${p.via ? `<span class="chip">Signed in with ${esc(p.via)}</span>` : ''}</div>
      <div class="pstats"><div><b>${kids.length}</b><span>Children</span></div><div><b>${r === null ? '–' : r + '%'}</b><span>Attendance</span></div><div><b>${up}</b><span>Matches</span></div></div>
      ${p.photo ? '<button class="btn" type="button" id="p-rm" style="margin-top:14px;width:100%">Remove photo</button>' : ''}</div>${profExtra()}</div>
    <div class="prof-main">
      <form class="form" id="pf" novalidate><h3>Personal details</h3>
        <div class="field"><label for="p-name">Full name *</label><input id="p-name" value="${esc(p.name)}" autocomplete="name"><span class="err" id="p-name-e"></span></div>
        <div class="field"><label for="p-email">Email address *</label><input id="p-email" type="email" value="${esc(p.email)}" autocomplete="email"><span class="err" id="p-email-e"></span></div>
        <div class="field"><label for="p-phone">Phone number *</label><input id="p-phone" type="tel" value="${esc(p.phone)}" autocomplete="tel"><span class="err" id="p-phone-e"></span></div>
        <div class="field"><label for="p-city">City</label><input id="p-city" value="${esc(p.city)}" autocomplete="address-level2"></div>
        <div class="field full"><label for="p-addr">Home address</label><input id="p-addr" value="${esc(p.address)}" autocomplete="street-address"></div>
        <div class="field"><label for="p-ecn">Emergency contact name</label><input id="p-ecn" value="${esc(p.ecName)}"></div>
        <div class="field"><label for="p-ecp">Emergency contact phone</label><input id="p-ecp" type="tel" value="${esc(p.ecPhone)}"><span class="err" id="p-ecp-e"></span></div>
        <div class="field full"><button class="btn btn-p" type="submit">Save changes</button></div><div class="msg" id="p-msg" role="status"></div></form>
      <form class="form" id="pn" novalidate><h3>Notifications</h3><p class="sub">Choose what the academy sends you.</p>${sw('n-match', 'Match reminders', 'A reminder the day before every fixture.', p.prefs.match)}${sw('n-att', 'Attendance alerts', 'Know when a child is marked absent or late.', p.prefs.attend)}${sw('n-news', 'Academy news', 'Trial days, camps and monthly updates.', p.prefs.news)}</form>
      <form class="form" id="pp" novalidate><h3>Change password</h3>
        <div class="field full"><label for="w-cur">Current password</label><input id="w-cur" type="password" autocomplete="current-password"><span class="err" id="w-cur-e"></span></div>
        <div class="field"><label for="w-new">New password</label><input id="w-new" type="password" autocomplete="new-password"><span class="err" id="w-new-e"></span></div>
        <div class="field"><label for="w-new2">Confirm new password</label><input id="w-new2" type="password" autocomplete="new-password"><span class="err" id="w-new2-e"></span></div>
        <div class="field full"><button class="btn" type="submit">Update password</button></div><div class="msg" id="w-msg" role="status"></div></form>
    </div></div>`;
    const store = o => K.set(PKEY, JSON.stringify(Object.assign(jget(PKEY, {}), o)));
    $('#pf').addEventListener('submit', e => {
      e.preventDefault(); let ok = true; const v = id => $('#' + id).value.trim();
      const chk = (id, bad, m) => { $('#' + id).classList.toggle('bad', bad); $('#' + id + '-e').textContent = bad ? m : ''; if (bad) ok = false; };
      chk('p-name', v('p-name').length < 2, 'Enter your full name.'); chk('p-email', !mailOk(v('p-email')), 'Enter a valid email address.'); chk('p-phone', !/^[0-9+\s-]{8,15}$/.test(v('p-phone')), 'Enter a valid phone number.'); chk('p-ecp', !!v('p-ecp') && !/^[0-9+\s-]{8,15}$/.test(v('p-ecp')), 'Enter a valid phone number.');
      const m = $('#p-msg'); m.classList.add('show'); if (!ok) { m.textContent = 'Please fix the highlighted fields.'; return; }
      store({ name: v('p-name'), email: v('p-email'), phone: v('p-phone'), city: v('p-city'), address: v('p-addr'), ecName: v('p-ecn'), ecPhone: v('p-ecp') });
      $('#p-nm').textContent = v('p-name'); $('#p-ml').textContent = v('p-email'); paintUser(); m.textContent = 'Profile saved.';
    });
    const pref = () => store({ prefs: { match: $('#n-match').checked, attend: $('#n-att').checked, news: $('#n-news').checked } });
    $$('#pn input').forEach(i => i.addEventListener('change', pref));
    $('#pp').addEventListener('submit', e => {
      e.preventDefault(); let ok = true; const pw = $('#w-new').value;
      const chk = (id, bad, m) => { $('#' + id).classList.toggle('bad', bad); $('#' + id + '-e').textContent = bad ? m : ''; if (bad) ok = false; };
      chk('w-cur', $('#w-cur').value.length < 6, 'Enter your current password.'); chk('w-new', pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw), 'Use at least 8 characters with a letter and a number.'); chk('w-new2', $('#w-new2').value !== pw || !pw, 'Passwords do not match.');
      const m = $('#w-msg'); m.classList.add('show'); m.textContent = ok ? 'Password updated.' : 'Please fix the highlighted fields.'; if (ok) $('#pp').reset();
    });
    // photo: crop to a square and shrink so it fits comfortably in browser storage
    $('#p-photo').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f || !/^image\//.test(f.type)) return; const url = URL.createObjectURL(f), im = new Image();
      im.onload = () => { const n = 240, c = document.createElement('canvas'), x = c.getContext('2d'), sz = Math.min(im.width, im.height); c.width = c.height = n; x.drawImage(im, (im.width - sz) / 2, (im.height - sz) / 2, sz, sz, 0, 0, n, n); URL.revokeObjectURL(url); store({ photo: c.toDataURL('image/jpeg', .85) }); paintUser(); profile(); };
      im.src = url;
    });
    const rm = $('#p-rm'); if (rm) rm.onclick = () => { store({ photo: '' }); paintUser(); profile(); };
  }
  const R = { overview, children, enroll, attendance, matches, profile };
  function refresh(names) { names.forEach(n => { if (n !== 'enroll') R[n](); }); }
  overview(); children(); enroll(); enrollExtra(); attendance(); matches(); profile();
  document.addEventListener('click', e => { const a = e.target.closest('[data-kid]'); if (a) { $('#p-attendance').dataset.kid = a.dataset.kid; attendance(a.dataset.kid); } });
  function route() { let h = (location.hash || '#overview').slice(1); if (!R[h]) h = 'overview'; $$('.pn').forEach(p => p.classList.toggle('on', p.id === 'p-' + h)); $$('[data-nav]').forEach(a => { const on = a.dataset.nav === h; a.classList.toggle('on', on); if (on) { a.setAttribute('aria-current', 'page'); a.scrollIntoView({ inline: 'nearest', block: 'nearest' }); } else a.removeAttribute('aria-current'); }); scrollTo(0, 0); const pe = $('#p-' + h); if (pe) countUp(pe); }
  addEventListener('hashchange', route); route();
  const LD = document.getElementById('loader'); if (LD) LD.remove();
})();
