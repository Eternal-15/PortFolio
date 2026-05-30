/* ============================================================
   CYBER-CIPHER — script.js
   ============================================================ */

// ─── 1. CLEAN URL NAVIGATION ─────────────────────────────────

const SECTIONS = ['home','about','skills','projects','workshops','education','contact'];

function getPathSection() {
  const path = window.location.pathname.replace(/^\/|\/$/g,'');
  return SECTIONS.includes(path) ? path : 'home';
}

function scrollToSection(id, pushState = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = document.getElementById('navbar')?.offsetHeight || 60;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - navH, behavior: 'smooth' });
  if (pushState) history.pushState({ section: id }, '', id === 'home' ? '/' : '/' + id);
}

document.querySelectorAll('a[data-nav]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const sec = a.getAttribute('data-nav');
    scrollToSection(sec);
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('hamburger').setAttribute('aria-expanded','false');
  });
});

window.addEventListener('popstate', e => {
  scrollToSection((e.state?.section) || getPathSection(), false);
});

window.addEventListener('DOMContentLoaded', () => {
  const sec = getPathSection();
  if (sec !== 'home') setTimeout(() => scrollToSection(sec, false), 80);
  history.replaceState({ section: sec }, '', window.location.pathname);
});

// ─── 2. SCROLL SPY ───────────────────────────────────────────

const navLinks = document.querySelectorAll('.nav-links a[data-nav]');

// Proper observer setup
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('data-section');
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('data-nav') === id));
      history.replaceState({ section: id }, '', id === 'home' ? '/' : '/' + id);
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

document.querySelectorAll('section[data-section]').forEach(s => spy.observe(s));

// ─── 3. HAMBURGER ────────────────────────────────────────────

const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
hamburger?.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

// ─── 4. STAT COUNTER ─────────────────────────────────────────

function countUp(el) {
  const target = +el.getAttribute('data-target');
  let cur = 0;
  const step = target / 60;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur);
    if (cur >= target) { el.textContent = target; clearInterval(t); }
  }, 20);
}
const aboutSection = document.getElementById('about');

if (aboutSection && 'IntersectionObserver' in window) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num').forEach(countUp);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 }).observe(aboutSection);
} else {
  document.querySelectorAll('.stat-num').forEach(el => {
    el.textContent = el.getAttribute('data-target') || '0';
  });
}

// ─── 5. DATA STREAM BACKGROUND ───────────────────────────────
// Floating data fragments — adapted from reference code, green neon

const canvas = document.getElementById('data-stream-bg');
const ctx    = canvas.getContext('2d');

const FRAGS = [
  '0.992','1.05','NULL','NaN','0.01','True','False',
  'GET','POST','200_OK','404','assert','pytest',
  'def','import','class','{ }','[ ]','0x1F','err',
  '0.823','pass','req','res','200','test()'
];

let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Particle {
  constructor(initY) {
    this.reset();
    if (initY !== undefined) this.y = Math.random() * H;
  }
  reset() {
    this.x     = Math.random() * W;
    this.y     = -20;
    this.speed = Math.random() * 0.4 + 0.08;
    this.text  = FRAGS[Math.floor(Math.random() * FRAGS.length)];
    this.alpha = Math.random() * 0.25 + 0.05;
    this.size  = Math.floor(Math.random() * 4) + 10;
  }
  update() {
    this.y += this.speed;
    if (this.y > H + 20) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(49,195,255,${this.alpha})`;
    ctx.font = `${this.size}px "JetBrains Mono", monospace`;
    ctx.fillText(this.text, this.x, this.y);
  }
}

function initParticles() {
  particles = [];
  const n = Math.floor(W / 22);
  for (let i = 0; i < n; i++) particles.push(new Particle(true));
}

let last = 0;
function loop(ts) {
  if (ts - last > 60) { // ~16fps — smooth but light
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    last = ts;
  }
  requestAnimationFrame(loop);
}

resize();
initParticles();
requestAnimationFrame(loop);
window.addEventListener('resize', () => { resize(); initParticles(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(loop); });

// ─── 6. NAVBAR SCROLL EFFECT ─────────────────────────────────

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.borderBottomColor = window.scrollY > 20
    ? 'rgba(49,195,255,0.3)' : 'rgba(19,115,154,0.15)';
}, { passive: true });

// ─── 7. CONTACT FORM → MAILTO ────────────────────────────────

document.getElementById('run-query')?.addEventListener('click', () => {
  const email = document.getElementById('q-email')?.value.trim();
  const org   = document.getElementById('q-org')?.value.trim();
  const msg   = document.getElementById('q-msg')?.value.trim();
  if (!email || !msg) {
    alert('[ ERROR ] SELECT email and WHERE message are required.');
    return;
  }
  const body = `From: ${email}\nOrganization: ${org || 'N/A'}\n\n${msg}`;
  window.location.href = `mailto:shakyasambad5@gmail.com?subject=Portfolio Query&body=${encodeURIComponent(body)}`;
});
