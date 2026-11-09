/* M. Imran — portfolio behaviour
   nav · theme · scroll reveal · active section · GitHub feed · contact form */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var emailJsReady = false;
  if (CFG.emailJs && CFG.emailJs.publicKey && window.emailjs) {
    try {
      window.emailjs.init(CFG.emailJs.publicKey);
      emailJsReady = true;
    } catch (err) {
      emailJsReady = false;
    }
  }

  /* ---------------- 1. NAVBAR ---------------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function syncNavChrome() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 12);
    var bar = document.getElementById('scrollBar');
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    var top = document.getElementById('toTop');
    if (top) top.hidden = y < window.innerHeight * 0.6;
  }

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  window.addEventListener('scroll', syncNavChrome, { passive: true });
  window.addEventListener('resize', syncNavChrome);
  syncNavChrome();

  /* ---------------- 1b. THEME ----------------
     The head script has already chosen and applied a theme before first paint.
     This only keeps the button in sync, stores an explicit choice, and follows
     the system preference while the visitor has never picked one. */
  var THEME_KEY = 'mi-theme';
  var themeBtn = document.getElementById('themeToggle');

  function storedTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (err) { return null; }          // storage blocked: run stateless
  }

  function applyTheme(theme, remember) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.getElementById('metaTheme');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#EEF2F9' : '#080D19');
    if (remember) { try { localStorage.setItem(THEME_KEY, theme); } catch (err) {} }
    if (themeBtn) {
      // name stays "Light theme" so aria-pressed alone carries the state
      themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
      themeBtn.title = theme === 'light' ? 'Light theme is on' : 'Light theme is off';
    }
  }

  if (themeBtn) {
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark', false);
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next, true);
    });
  }

  var systemLight = window.matchMedia('(prefers-color-scheme: light)');
  systemLight.addEventListener('change', function (e) {
    if (storedTheme()) return;
    applyTheme(e.matches ? 'light' : 'dark', false);
  });

  var toTop = document.getElementById('toTop');
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------------- 2. ACTIVE SECTION ---------------- */
  var navMap = {};
  document.querySelectorAll('.nav__link[href^="#"]').forEach(function (a) {
    navMap[a.getAttribute('href').slice(1)] = a;
  });

  var sections = Object.keys(navMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove('is-active'); });
          var link = navMap[en.target.id];
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- 3. SCROLL REVEAL ---------------- */
  var revealables = document.querySelectorAll('[data-reveal]');

  // stagger siblings that enter together
  document.querySelectorAll('section').forEach(function (sec) {
    var i = 0;
    sec.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.setProperty('--i', i++);
    });
  });

  if (reduce || !('IntersectionObserver' in window) || document.visibilityState === 'hidden') {
    // Search crawlers and headless renderers never receive IntersectionObserver
    // callbacks — reveal everything rather than serving a blank page.
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 4. HERO ENTRANCE ---------------- */
  var hero = document.querySelector('.hero');
  // plain timer, not rAF: animation frames are throttled on hidden/background pages
  setTimeout(function () {
    if (!hero) return;
    // A page that produces no frames never advances the reveal transition, which
    // would leave the name parked under its mask for crawlers and screenshot
    // renderers. Settle at once when hidden, and always once the entrance is over.
    if (document.visibilityState === 'hidden') hero.classList.add('is-static');
    hero.classList.add('is-ready');
  }, reduce ? 0 : 120);
  setTimeout(function () { if (hero) hero.classList.add('is-static'); }, 2200);

  /* ---------------- 4b. CONFIGURED ASSETS ---------------- */
  // Missing user assets are never requested: the labelled placeholder is the
  // default src, and a real file is swapped in only once config points at it.
  function applyAssets() {
    var A = CFG.assets || {};
    var frame = document.querySelector('[data-portrait]');
    var profiles = document.querySelectorAll('[data-asset="profile"]');

    if (A.profile && profiles.length) {
      profiles.forEach(function (img) {
        img.src = A.profile;
        img.alt = 'Muhammad Imran, Full Stack Web Developer';
      });
      if (frame) frame.classList.remove('is-placeholder');
    } else if (frame) {
      frame.classList.add('is-placeholder');
    }

    var shots = A.screenshots || {};
    Object.keys(shots).forEach(function (key) {
      if (!shots[key]) return;
      var img = document.querySelector('[data-asset="' + key + '"]');
      if (!img) return;
      var shot = img.closest('.shot');
      if (shot) shot.classList.remove('is-placeholder');
      img.src = shots[key];
      img.alt = img.alt.replace('Placeholder — the genuine screenshot of', 'Screenshot of');
      var media = img.closest('.proj__media');
      var cap = media && media.querySelector('[data-cap]');
      if (cap) cap.textContent = 'Project preview';
    });
  }
  applyAssets();

  /* ---------------- 5. TECHNOLOGY ICONS ---------------- */
  var ICONS = {
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8 5 12l4 4"/><path d="m15 8 4 4-4 4"/></svg>',
    css: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5 7 12l2 7"/><path d="M15 5l2 7-2 7"/></svg>',
    js: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 15.5c0 1.4 1 2 2.2 2 1.4 0 2.3-.9 2.3-2.6V8"/><path d="M8 8h5"/><path d="M18 9.5C17.4 8.7 16.6 8.3 15.7 8.3c-1.3 0-2.1.8-2.1 1.8 0 2.6 4.4 1.9 4.4 4.8 0 1.4-1.2 2.3-2.7 2.3-1.2 0-2.2-.5-2.9-1.4"/></svg>',
    bootstrap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M13 3 6 13h4l-1 8 8-11h-4.2z"/></svg>',
    react: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/></svg>',
    node: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3 20 7.5v9L12 21 4 16.5v-9z"/><path d="M9.5 15V9l5 6V9"/></svg>',
    express: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M13 4 5 12l8 8"/><path d="M19 12h-6"/></svg>',
    rest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M7 8h10M7 12h10M7 16h6"/><path d="M4 5v14"/></svg>',
    mongo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3c3.4 3 5 6 5 9.2 0 3.2-2 5.6-5 8.8-3-3.2-5-5.6-5-8.8C7 9 8.6 6 12 3z"/><path d="M12 3v18"/></svg>',
    git: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="12" r="2.2"/><path d="M7 8.2v7.6M9.2 6.6c4 0 5.6 1.6 5.6 5.4"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4 1.2-4-2.2-5.6-2.8M15 21v-3.3c0-1 .3-1.5-.4-2.2 2.7-.3 4.4-1.6 4.4-4.6 0-1.4-.5-2.4-1.3-3.2.3-.9.2-2-.2-2.9 0 0-1.2-.3-3.4 1.3a11 11 0 0 0-5.4 0C6.5 5.5 5.3 5.8 5.3 5.8c-.4.9-.5 2-.2 2.9-.8.8-1.3 1.8-1.3 3.2 0 3 1.7 4.3 4.4 4.6-.5.5-.7 1.1-.6 2V21"/></svg>',
    vscode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="m15 4 5 2v12l-5 2-7-8z"/><path d="m15 9-6 3 6 3"/></svg>',
    cpp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 8 6 12l4 4"/><path d="M15 10v5M18 10v5M13 12.5h8"/></svg>',
    oop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9.5" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/></svg>'
  };

  document.querySelectorAll('[data-ico]').forEach(function (el) {
    var svg = ICONS[el.getAttribute('data-ico')];
    if (svg) el.innerHTML = svg;
  });

  /* ---------------- 6. CONTACT LINKS ---------------- */
  function applyContactLinks() {
    var mail = CFG.email || '';
    var li = CFG.linkedin || '';

    ['email', 'linkedin'].forEach(function (kind) {
      var value = kind === 'email' ? mail : li;

      document.querySelectorAll('[data-social="' + kind + '"]').forEach(function (a) {
        var inHero = !!a.closest('.socials');
        var inList = !!a.closest('.contact__list');
        // Update contact-list labels and preserve any decorative icon markup.
        var label = inHero ? a.querySelector('span') : null;

        if (value) {
          if (kind === 'email') {
            a.href = 'mailto:' + value;
          } else {
            a.href = value;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          if (label) label.textContent = kind === 'email' ? value : 'LinkedIn';
          if (inList) a.textContent = kind === 'email' ? value : 'LinkedIn profile';
        } else {
          a.classList.add('is-placeholder');
          a.addEventListener('click', function (e) { e.preventDefault(); });
          if (label) label.textContent = (kind === 'email' ? 'Email' : 'LinkedIn') + ' — not set';
          if (inList) {
            a.textContent = kind === 'email'
              ? 'Add your email in js/config.js'
              : 'Add your LinkedIn URL in js/config.js';
          }
        }
      });
    });
  }
  applyContactLinks();
  if (CFG.github) {
    document.querySelectorAll('[data-profile-link]').forEach(function (a) {
      a.href = CFG.github;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }

  /* ---------------- 8. CONTACT FORM ---------------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  var RULES = {
    name: function (v) { return v.trim().length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    subject: function (v) { return v.trim().length >= 3; },
    message: function (v) { return v.trim().length >= 10; }
  };

  function fieldOf(input) { return input.closest('.field'); }

  function validateInput(input) {
    var rule = RULES[input.name];
    if (!rule) return true;
    var valid = rule(input.value);
    fieldOf(input).classList.toggle('has-error', !valid);
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    return valid;
  }

  form.querySelectorAll('input, textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validateInput(input); });
    input.addEventListener('input', function () {
      if (fieldOf(input).classList.contains('has-error')) validateInput(input);
      if (status.classList.contains('is-err')) {
        var stillInvalid = [].some.call(form.querySelectorAll('input, textarea'), function (field) {
          return !RULES[field.name](field.value);
        });
        if (!stillInvalid) {
          status.className = 'form__status';
          status.textContent = '';
        }
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inputs = [].slice.call(form.querySelectorAll('input, textarea'));
    var bad = inputs.filter(function (i) { return !validateInput(i); });

    if (bad.length) {
      status.className = 'form__status is-err';
      status.textContent = 'Please check the highlighted fields. Complete every field and enter a valid email address.';
      bad[0].focus();
      return;
    }

    if (emailJsReady && CFG.emailJs.serviceId && CFG.emailJs.templateId) {
      var sendButton = form.querySelector('button[type="submit"]');
      var originalButtonHTML = sendButton.innerHTML;
      sendButton.disabled = true;
      sendButton.textContent = 'Sending…';
      status.className = 'form__status';
      status.textContent = 'Sending your message…';

      window.emailjs.sendForm(CFG.emailJs.serviceId, CFG.emailJs.templateId, form)
        .then(function () {
          status.className = 'form__status is-ok';
          status.textContent = 'Your message was sent successfully.';
          form.reset();
        })
        .catch(function (err) {
          console.error('EmailJS submission failed:', err);
          status.className = 'form__status is-err';
          status.textContent = 'Your message was not sent. Please try again or email me directly.';
        })
        .then(function () {
          sendButton.disabled = false;
          sendButton.innerHTML = originalButtonHTML;
        });
      return;
    }

    if (CFG.formEndpoint) {
      var payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
      };
      status.className = 'form__status';
      status.textContent = 'Sending…';
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          status.className = 'form__status is-ok';
          status.textContent = 'Your message was sent successfully.';
          form.reset();
        })
        .catch(function () {
          status.className = 'form__status is-err';
          status.textContent = 'Your message was not sent. Please email me directly instead.';
        });
      return;
    }

    if (!CFG.email) {
      status.className = 'form__status is-err';
      status.textContent = 'Your message was not sent. The email service is not configured yet.';
      return;
    }

    var body =
      'Name: ' + form.name.value.trim() + '\n' +
      'Email: ' + form.email.value.trim() + '\n\n' +
      form.message.value.trim() + '\n';

    var href = 'mailto:' + CFG.email +
      '?subject=' + encodeURIComponent(form.subject.value.trim()) +
      '&body=' + encodeURIComponent(body);

    status.className = 'form__status';
    status.textContent = 'Your email app is opening. The message is not sent until you press Send there.';
    window.location.href = href;
    form.reset();
  });

  /* ---------------- 9. MISC ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
