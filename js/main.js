/* =============================================================================
   Sherish — interaction & scroll orchestration
   ========================================================================== */
(function () {
  'use strict';
  var S = window.SITE;
  // `?still` freezes ambient motion (smooth-scroll + petals) for screenshots/QA
  var still = /[?&]still\b/.test(location.search);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || still;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeIO = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  document.body.classList.add('js');
  if (still) document.body.classList.add('still');
  window.addEventListener('load', function () { requestAnimationFrame(function () { document.body.classList.remove('preload'); }); });

  // Name order ("lead") — flips the pair to the side the guest entered from. The landing
  // seal is intentionally left as-is ("Ishita & Shreyam").
  var lead = 'ishita';
  try { var _sl = sessionStorage.getItem('sherishLead'); if (_sl === 'shreyam' || _sl === 'ishita') lead = _sl; } catch (e) {}
  function applyNameOrder() {
    var groomFirst = (lead === 'shreyam');
    var first = groomFirst ? S.couple.groom : S.couple.bride;
    var second = groomFirst ? S.couple.bride : S.couple.groom;
    var names = $('.names');
    if (names) { var sp = names.querySelectorAll('span'); if (sp.length >= 2) { sp[0].textContent = first; sp[1].textContent = second; } }
    var fm = $('.footer__mono'); if (fm) fm.innerHTML = first + ' <span>&amp;</span> ' + second;
    document.title = first + ' & ' + second + ' · 24 Feb 2027 · Jaipur';
  }
  function setLead(side) {
    lead = (side === 'shreyam') ? 'shreyam' : 'ishita';
    try { sessionStorage.setItem('sherishLead', lead); } catch (e) {}
    applyNameOrder();
  }

  /* ---------------------------------------------------------------- content */
  function fillContent() {
    $('#homeDate').textContent = S.dateLabel + ' · ' + S.venue.city.split(',')[0];
    if (S.couple.brideParents) $('#ishitaParents').textContent = S.couple.brideParents;
    if (S.couple.groomParents) $('#shreyamParents').textContent = S.couple.groomParents;
    // journey
    $('#lblFrom').innerHTML = '<span>' + S.journey.from.flag + '</span><b>' + S.journey.from.name + '</b>';
    $('#lblTo').innerHTML = '<span>' + S.journey.to.flag + '</span><b>' + S.journey.to.name + '</b>';
    $('#journeyCap').textContent = S.journey.caption;
    // venue
    $('#venueName').textContent = S.venue.name;
    $('#venueCity').textContent = S.venue.city;
    $('#venueDates').textContent = 'Check-in ' + S.venue.checkIn + ' · Check-out ' + S.venue.checkOut;
    // finale
    $('#finaleHash').textContent = S.couple.hashtag;
    $('#finaleDate').textContent = S.dateLabel + ' · ' + S.venue.name;
    var tw = $('#travelWa');
    if (tw && S.travelWhatsapp) { tw.href = 'https://wa.me/' + S.travelWhatsapp; var tn = $('#travelWaNote'); if (tn) tn.remove(); }
    else if (tw) { tw.removeAttribute('href'); tw.style.cssText = 'color:inherit;border:0'; }
    buildTimeline();
    buildActions();
  }

  function buildTimeline() {
    var tl = $('#timeline');
    S.events.forEach(function (e, i) {
      var el = document.createElement('article');
      el.className = 'event';
      el.setAttribute('data-idx', i);
      el.innerHTML =
        '<div class="event__node"></div>' +
        '<div class="event__card">' +
          '<div class="event__day">' + e.day + '</div>' +
          '<h3 class="event__name">' + e.name + '</h3>' +
          (e.fn ? '<div class="event__fn">' + e.fn + '</div>' : '') +
          '<div class="event__meta"><span>📍 <b>' + e.venue + '</b></span></div>' +
          '<p class="event__note">' + e.note + '</p>' +
          '<a class="event__cal" href="' + gcal(e) + '" target="_blank" rel="noopener">＋ Add to calendar</a>' +
        '</div>' +
        '<div class="event__media">' +
          '<div class="event__dress">' + e.dress + '</div>' +
          '<img src="assets/' + e.outfit + '" alt="Outfit suggestions for ' + e.name + '" loading="lazy"></div>';
      tl.appendChild(el);
    });
  }

  /* ---------------------------------------------------------- calendar / rsvp */
  function icsStamp(iso) {
    var d = new Date(iso);
    return d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
  function dc(dateStr) { return dateStr.replace(/-/g, ''); }                    // YYYY-MM-DD -> YYYYMMDD
  function dcNext(dateStr) {                                                     // all-day events end on the next day
    var d = new Date(dateStr + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
  }
  function gcal(e) {
    var loc = S.venue.name + ', ' + S.venue.city;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(e.name + ' — ' + S.couple.bride + ' & ' + S.couple.groom) +
      '&dates=' + dc(e.date) + '/' + dcNext(e.date) +
      '&location=' + encodeURIComponent(loc) +
      '&details=' + encodeURIComponent(e.note);
  }
  function buildActions() {
    // RSVP
    var rsvp = $('#rsvpBtn');
    if (S.rsvpWhatsapp) {
      rsvp.href = 'https://wa.me/' + S.rsvpWhatsapp + '?text=' + encodeURIComponent(S.rsvpMessage);
    } else {
      rsvp.setAttribute('hidden', '');
      var note = document.createElement('p');
      note.style.cssText = 'color:rgba(255,255,255,.75);font-size:.8rem;margin:.4em 0 0;letter-spacing:.04em';
      note.textContent = 'RSVP link coming soon — check back shortly 💌';
      $('.finale__actions').appendChild(note);
    }
    // Save the Date — full itinerary .ics
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sherish//Wedding//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    S.events.forEach(function (e) {
      lines.push('BEGIN:VEVENT', 'UID:' + e.key + '@sherish.live', 'DTSTAMP:' + icsStamp(new Date().toISOString()),
        'DTSTART;VALUE=DATE:' + dc(e.date), 'DTEND;VALUE=DATE:' + dcNext(e.date),
        'SUMMARY:' + esc(e.name + ' — ' + S.couple.bride + ' & ' + S.couple.groom),
        'LOCATION:' + esc(S.venue.name + ', ' + S.venue.city),
        'DESCRIPTION:' + esc(e.note + ' · Dress: ' + e.dress), 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    $('#saveBtn').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  }

  /* ---------------------------------------------------------------- countdown */
  function countdown() {
    var target = new Date(S.weddingDate).getTime();
    var box = $('#countdown');
    var units = [['Days', 864e5], ['Hours', 36e5], ['Minutes', 6e4], ['Seconds', 1e3]];
    box.innerHTML = units.map(function (u) {
      return '<div class="cd-box"><div class="cd-num" data-u="' + u[0] + '">–</div><div class="cd-lab">' + u[0] + '</div></div>';
    }).join('');
    var nums = {};
    $$('.cd-num', box).forEach(function (n) { nums[n.getAttribute('data-u')] = n; });
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        units.forEach(function (u) { nums[u[0]].textContent = '0'; });
        box.insertAdjacentHTML('afterend', '<p class="tagline" style="color:var(--gold-dk)">Just married! 🎉</p>');
        return;
      }
      var rem = diff;
      units.forEach(function (u) { var v = Math.floor(rem / u[1]); rem -= v * u[1]; nums[u[0]].textContent = v; });
      requestAnimationFrame(function () { setTimeout(tick, 1000); });
    }
    tick();
  }

  /* -------------------------------------------------------- ambient petals */
  var petalLayer = $('#petals');
  function spawnPetal(container, opts) {
    opts = opts || {};
    var p = document.createElement('div');
    p.className = 'petal';
    var size = 8 + Math.random() * 12;
    p.style.left = (opts.left != null ? opts.left : Math.random() * 100) + '%';
    p.style.width = p.style.height = size + 'px';
    p.style.animationDuration = (opts.dur || (6 + Math.random() * 6)) + 's';
    p.style.opacity = 0.6 + Math.random() * 0.3;
    if (opts.top != null) p.style.top = opts.top;
    (container || petalLayer).appendChild(p);
    p.addEventListener('animationend', function () { p.remove(); });
  }
  function ambientPetals() {
    if (reduce) return;
    setInterval(function () {
      if (document.hidden) return;
      if (petalLayer.childElementCount < 8) spawnPetal();
    }, 1500);
  }
  function petalBurst() {
    var host = $('#finalePetals');
    for (var i = 0; i < 26; i++) {
      (function (i) {
        setTimeout(function () { spawnPetal(host, { top: '-4%', dur: 5 + Math.random() * 4 }); }, i * 70);
      })(i);
    }
  }

  /* ---------------------------------------------------------------- entrance */
  var lenis = null;
  function initSmooth() {
    // Native scroll on every device. Lenis smooth-wheel felt sluggish on desktop over
    // these heavy sections; ScrollTrigger `scrub` still eases the scene morphs, so the
    // motion stays smooth while the scroll itself is snappy (matching mobile's feel).
    return;
  }
  function goTo(sel, immediate) {
    var el = $(sel); if (!el) return;
    if (lenis) lenis.scrollTo(el, { immediate: !!immediate, duration: 1.2 });
    else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
  function revealChrome() { $('#topbar').classList.add('show'); $('#garland').classList.add('show'); }

  function playEntrance(side) {
    var wrap = $('#transition');
    setLead(side);
    if (reduce || !window.gsap) { goTo('#home', true); revealChrome(); return; }
    var palki = $('#palki'), baraat = $('#baraat');
    var rider = side === 'shreyam' ? baraat : (side === 'ishita' ? palki : null);
    // hide BOTH first so the non-chosen vehicle never lingers on screen
    gsap.set([palki, baraat], { opacity: 0, x: '-140vw' });
    wrap.classList.add('active');
    var mobile = matchMedia('(max-width:760px)').matches;
    var half = mobile ? 1.7 : 2.7;   // each leg of the crossing
    var hold = 0.5;                  // pause in the middle of the screen
    var tl = gsap.timeline({
      onComplete: function () { wrap.classList.remove('active'); gsap.set([palki, baraat], { opacity: 0 }); }
    });
    tl.to('.veil', { opacity: 1, duration: 0.6, ease: 'power2.in' }, 0);
    tl.add(function () { goTo('#home', true); revealChrome(); }, 0.55);
    if (rider) {
      var w = rider.getBoundingClientRect().width || 600;
      var centerX = (window.innerWidth - w) / 2;
      gsap.set(rider, { x: '-54vw', opacity: 1 });
      tl.to(rider, { x: centerX, duration: half, ease: 'power2.out' }, 0.55);          // glide to centre
      tl.to(rider, { x: '124vw', duration: half, ease: 'power2.in' }, 0.55 + half + hold); // hold, then exit
      tl.to(rider.querySelector('.rider__g'), { y: -14, duration: 0.5, yoyo: true, repeat: Math.round((half * 2 + hold) * 2), ease: 'sine.inOut' }, 0.55);
    }
    var end = 0.55 + half + hold + half;
    tl.to('.veil', { opacity: 0, duration: 0.7, ease: 'power2.out' }, rider ? end - 0.55 : 1.0);
  }
  function initLanding() {
    $$('.half').forEach(function (h) {
      h.addEventListener('click', function () { playEntrance(h.getAttribute('data-side')); });
    });
    // chrome appears once past the landing regardless of how they got there
    if (window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: '#home', start: 'top 70%', onEnter: revealChrome, onLeaveBack: function () { $('#topbar').classList.remove('show'); $('#garland').classList.remove('show'); } });
    }
    $('.brand').addEventListener('click', function (ev) { ev.preventDefault(); goTo('#home'); });
  }

  /* ----------------------------------------------------------- scroll scenes */
  function initScenes() {
    if (!window.gsap || !window.ScrollTrigger) { staticFallback(); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    // recompute all trigger positions once images/fonts settle (prevents stale pins on scroll-up)
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    // generic reveals
    var targets = ['.section-title', '.eyebrow.center', '.journey__meta', '.worldwrap', '.home__text > *', '.events__sub', '.finale__title', '.finale__actions', '.finale__hash', '.finale__date'];
    $$(targets.join(',')).forEach(function (el) { el.classList.add('anim'); });
    // pinned sections: keep their headings always visible (reveal-on-scroll is unreliable while pinned)
    $$('#journey .anim').forEach(function (el) { el.classList.remove('anim'); });

    if (reduce) {
      $$('.anim').forEach(function (el) { el.classList.add('is-in'); });
      staticFallback();
      return;
    }

    ScrollTrigger.batch('.anim', {
      start: 'top 86%',
      onEnter: function (els) { els.forEach(function (el, i) { setTimeout(function () { el.classList.add('is-in'); }, i * 80); }); }
    });

    // garland progress
    var fill = $('#garlandFill'), bud = $('#garlandBud');
    ScrollTrigger.create({
      start: 0, end: 'max', onUpdate: function (self) {
        var p = self.progress;
        if (fill) fill.style.strokeDashoffset = String(1000 * (1 - p));
        if (bud) bud.style.transform = 'translateY(' + (p * (window.innerHeight - 26)) + 'px)';
      }
    });

    initJourney();
    initVenue();
    initEvents();

    // finale petal burst
    ScrollTrigger.create({ trigger: '#finale', start: 'top 60%', once: true, onEnter: petalBurst });
  }

  function initJourney() {
    var arc = $('#routeArc'), balloon = $('#balloon'), milesEl = $('#milesNum');
    var len = arc.getTotalLength();
    arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len;
    var start = arc.getPointAtLength(0);
    balloon.setAttribute('transform', 'translate(' + start.x + ',' + start.y + ') scale(3)');
    ScrollTrigger.create({
      trigger: '#journey', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
      onUpdate: function (self) {
        // journey is pinned; count up across the pinned scroll and settle at ~85%.
        var p = Math.min(1, self.progress / 0.85);
        arc.style.strokeDashoffset = String(len * (1 - p));
        var pt = arc.getPointAtLength(len * p);
        balloon.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ') scale(3)');
        milesEl.textContent = Math.round(p * S.journey.miles).toLocaleString();
      }
    });
  }

  function initVenue() {
    var frames = $$('.vframe');
    if (!frames.length) return;
    var labelEl = $('#venueNowLabel'), subEl = $('#venueNowSub'), bar = $('#venueBar');
    var imgs = frames.map(function (f) { return f.querySelector('img'); });
    var lastIdx = -1;
    function setActive(idx) {
      if (idx === lastIdx) return; lastIdx = idx;
      frames.forEach(function (f, i) { f.classList.toggle('is-active', i === idx); });
      if (labelEl) labelEl.textContent = frames[idx].getAttribute('data-label');
      if (subEl) subEl.textContent = frames[idx].getAttribute('data-sub');
    }
    setActive(0);
    ScrollTrigger.create({
      trigger: '#venue', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress, n = frames.length;
        var idx = Math.min(n - 1, Math.floor(p * n));
        setActive(idx);
        var local = p * n - idx;
        if (imgs[idx]) imgs[idx].style.transform = 'scale(' + (1.05 + local * 0.14).toFixed(3) + ')';
        if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      }
    });
  }

  function initEvents() {
    // reveal each event card
    $$('.event').forEach(function (ev) {
      ScrollTrigger.create({ trigger: ev, start: 'top 78%', once: true, onEnter: function () { ev.classList.add('is-in'); } });
    });
    // swatch → tint media background
    $$('.event').forEach(function (ev) {
      var media = $('.event__media', ev);
      $$('.sw', ev).forEach(function (sw) {
        sw.addEventListener('mouseenter', function () { media.style.background = 'radial-gradient(circle at 50% 20%, #fff, ' + sw.style.background + '33)'; });
      });
      ev.addEventListener('mouseleave', function () { if (media) media.style.background = ''; });
    });
  }

  function openOutfit(ev) {
    var e = S.events[+ev.getAttribute('data-idx')]; if (!e) return;
    $('#omodalImg').src = 'assets/' + e.outfit;
    $('#omodalImg').alt = 'Outfit suggestion for ' + e.name;
    $('#omodalName').textContent = e.name;
    $('#omodalDress').textContent = e.dress;
    $('#omodalSw').innerHTML = e.colors.map(function (c) { return '<span class="sw" style="background:' + c + '"></span>'; }).join('');
    var m = $('#outfitModal'); m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeOutfit() {
    var m = $('#outfitModal'); if (!m) return;
    m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function initOutfitModal() {
    var m = $('#outfitModal'); if (!m) return;
    $('#omodalClose').addEventListener('click', closeOutfit);
    m.addEventListener('click', function (e) { if (e.target === m) closeOutfit(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOutfit(); });
  }

  function buildPeacock() {
    var fan = $('#peacockFan'); if (!fan) return;
    var N = 11, spread = 78, baseX = 200, baseY = 152, feathers = [];
    for (var i = 0; i < N; i++) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = '<line x1="' + baseX + '" y1="' + baseY + '" x2="' + baseX + '" y2="46" stroke="#1f8f86" stroke-width="2"/>' +
        '<ellipse cx="' + baseX + '" cy="44" rx="9" ry="13" fill="#155e86"/>' +
        '<circle cx="' + baseX + '" cy="44" r="5" fill="#12716b"/>' +
        '<circle cx="' + baseX + '" cy="44" r="2.4" fill="#c9a24b"/>';
      g.setAttribute('transform', 'rotate(0 ' + baseX + ' ' + baseY + ')');
      fan.appendChild(g); feathers.push(g);
    }
    if (reduce) {
      feathers.forEach(function (g, i) { g.setAttribute('transform', 'rotate(' + (-spread + i * (2 * spread / (N - 1))) + ' ' + baseX + ' ' + baseY + ')'); });
      return;
    }
    gsap.set(fan, { opacity: 0 });
    ScrollTrigger.create({
      trigger: '#events', start: 'top 72%', once: true, onEnter: function () {
        gsap.to(fan, { opacity: 1, duration: 0.4 });
        feathers.forEach(function (g, i) {
          var ang = -spread + i * (2 * spread / (N - 1));
          gsap.fromTo(g, { rotation: 0, svgOrigin: baseX + ' ' + baseY, transformOrigin: baseX + 'px ' + baseY + 'px' },
            { rotation: ang, duration: 1.1, delay: i * 0.04, ease: 'back.out(1.6)' });
        });
      }
    });
  }

  /* --------------------------------------------------- static (reduced) states */
  function staticFallback() {
    var arc = $('#routeArc'), balloon = $('#balloon'), milesEl = $('#milesNum');
    if (arc) { arc.style.strokeDasharray = 'none'; arc.style.strokeDashoffset = 0; }
    if (milesEl) milesEl.textContent = S.journey.miles.toLocaleString();
    if (balloon) { var e = arc.getPointAtLength(arc.getTotalLength()); balloon.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ') scale(3)'); }
    $$('.event').forEach(function (ev) { ev.classList.add('is-in'); });
    var gf = $('#garlandFill'); if (gf) gf.style.strokeDashoffset = 0;
    var vl = $('#venueNowLabel'); if (vl) vl.textContent = 'The Central Courtyard';
    var vs = $('#venueNowSub'); if (vs) vs.textContent = 'Ceremony & Reception';
    revealChrome();
  }

  /* ---------------------------------------------------------------- audio */
  function initAudio() {
    var audio = $('#shehnai'), btn = $('#muteBtn');
    audio.preload = 'metadata';
    audio.addEventListener('canplay', function () { btn.hidden = false; });
    audio.addEventListener('loadedmetadata', function () { btn.hidden = false; });
    audio.addEventListener('error', function () { btn.hidden = true; });
    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.volume = 0.5; audio.play().then(function () { btn.classList.add('playing'); btn.querySelector('.mute__on').textContent = '♪ playing'; }).catch(function () {});
      } else { audio.pause(); btn.classList.remove('playing'); btn.querySelector('.mute__on').textContent = '♪ shehnai'; }
    });
  }

  /* ------------------------------------------------ wardrobe planner reveal */
  function initWardrobe() {
    var btn = $('#wardrobeBtn'), tl = $('#timeline'); if (!btn || !tl) return;
    btn.addEventListener('click', function () {
      var on = tl.classList.toggle('wardrobe-on');
      btn.classList.toggle('is-on', on);
      btn.innerHTML = on ? 'Hide the wardrobe planner' : 'Help me plan my wardrobe <span>(optional)</span>';
      // recompute pinned/triggered positions once the layout transition settles
      if (window.ScrollTrigger) { setTimeout(function () { ScrollTrigger.refresh(); }, 680); }
    });
    // show the button only while the cards are on screen — IntersectionObserver is
    // immune to the stale-position issues that plagued the ScrollTrigger approach.
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        btn.classList.toggle('show', entries[0].isIntersecting);
      }, { rootMargin: '-15% 0px -15% 0px' });
      io.observe(tl);
    } else { btn.classList.add('show'); }
  }

  /* ---------------------------------------------------------------- boot */
  fillContent();
  applyNameOrder();
  countdown();
  initAudio();
  initSmooth();
  initLanding();
  initScenes();
  initWardrobe();
  ambientPetals();
})();
