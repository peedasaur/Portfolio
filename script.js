/**
 * Portfolio — Aditya Sharma   |   script.js
 *
 * KEY FIXES vs previous version:
 *  - Hero content always visible (CSS defaults to opacity:1)
 *  - JS only hides NON-hero elements before observing them
 *  - Cursor uses #cur-dot and #cur-ring via transform3d (no layout reflow)
 *  - Cursor starts hidden, appears on first mousemove
 *  - No mix-blend-mode (avoids GPU compositing bugs)
 */
document.addEventListener('DOMContentLoaded', () => {

    /* ─── ELEMENT CACHE ─── */
    const html    = document.documentElement;
    const body    = document.body;
    const pl      = document.getElementById('pl');
    const plFill  = document.getElementById('plFill');
    const nav     = document.getElementById('nav');
    const sprog   = document.getElementById('sprog');
    const themeChk= document.getElementById('themeChk');
    const burger  = document.getElementById('burger');
    const drawer  = document.getElementById('drawer');
    const bgCanvas= document.getElementById('bg-canvas');

    /* ─── 1. THEME ─── */
    const saved = localStorage.getItem('pf-theme');
    if (saved) {
        html.setAttribute('data-theme', saved);
        if (themeChk) themeChk.checked = (saved === 'light');
    } else if (window.matchMedia('(prefers-color-scheme:light)').matches) {
        html.setAttribute('data-theme', 'light');
        if (themeChk) themeChk.checked = true;
    }
    themeChk?.addEventListener('change', () => {
        const t = themeChk.checked ? 'light' : 'dark';
        html.setAttribute('data-theme', t);
        localStorage.setItem('pf-theme', t);
    });

    /* ─── 2. PRELOADER ─── */
    onReady();

    function onReady() {
        initReveal();
        initSkillBars();
        initTilt();
        initCertShimmer();
        initScroll();
    }


    /* ─── 4. SCROLL EVENTS ─── */
    function initScroll() {
        /* Native passive scroll — instant, no lag */
        window.addEventListener('scroll', () => {
            onScrollUpdate(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
        }, { passive: true });
        onScrollUpdate(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);

        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const tgt = document.querySelector(a.getAttribute('href'));
                if (!tgt) return; e.preventDefault();
                window.scrollTo({ top: tgt.offsetTop - 70, behavior: 'smooth' });
                drawer?.classList.remove('open');
                burger?.classList.remove('open');
            });
        });
    }

    function onScrollUpdate(s, max) {
        if (sprog) sprog.style.width = ((s / max) * 100).toFixed(2) + '%';
        if (nav)   nav.classList.toggle('scrolled', s > 55);
        /* Parallax on hero */
        const heroLeft  = document.querySelector('.hero-left');
        const heroRight = document.querySelector('.hero-right');
        if (heroLeft)  heroLeft.style.transform  = `translateY(${s * .07}px)`;
        if (heroRight) heroRight.style.transform = `translateY(${s * .045}px)`;
        /* Nav highlight */
        document.querySelectorAll('section[id]').forEach(sec => {
            if (s + 85 >= sec.offsetTop && s + 85 < sec.offsetTop + sec.offsetHeight) {
                document.querySelectorAll('.nl').forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
                });
            }
        });
    }

    /* ─── 5. REVEAL ANIMATIONS ─── */
    function initReveal() {
        const ease = 'cubic-bezier(0.16,1,0.3,1)';

        /* reveal-up: hide all NON-hero items; hero items stay visible  */
        document.querySelectorAll('.reveal-up').forEach(el => {
            if (el.closest('#hero')) return; /* hero: already visible in CSS */
            el.style.opacity   = '0';
            el.style.transform = 'translateY(34px)';
        });

        const obsUp = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const d  = el.classList.contains('delay1') ? 100
                         : el.classList.contains('delay2') ? 200
                         : el.classList.contains('delay3') ? 300
                         : el.classList.contains('delay4') ? 400 : 0;
                setTimeout(() => {
                    el.style.transition = `opacity .85s ${ease}, transform .85s ${ease}`;
                    el.style.opacity    = '1';
                    el.style.transform  = 'translateY(0)';
                }, d);
                obs.unobserve(el);
            });
        }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal-up').forEach(el => {
            if (!el.closest('#hero')) obsUp.observe(el);
        });

        /* sec-eyebrow slide */
        document.querySelectorAll('.sec-eyebrow').forEach(el => {
            el.style.opacity = '0'; el.style.transform = 'translateX(-14px)';
            const obs2 = new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (!e.isIntersecting) return;
                    e.target.style.transition = `opacity .7s ${ease}, transform .7s ${ease}`;
                    e.target.style.opacity    = '1';
                    e.target.style.transform  = 'translateX(0)';
                    obs.unobserve(e.target);
                });
            }, { threshold: .1 });
            obs2.observe(el);
        });
    }

    /* ─── 6. SKILL BARS ─── */
    function initSkillBars() {
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const b = e.target;
                b.style.transition = 'width 1.6s cubic-bezier(0.16,1,0.3,1)';
                b.style.width      = (b.getAttribute('data-w') || '70') + '%';
                observer.unobserve(b);
            });
        }, { threshold: .5 });
        document.querySelectorAll('.bar-fill').forEach(b => { b.style.width = '0'; obs.observe(b); });
    }

    /* ─── 7. 3D TILT (project cards) ─── */
    function initTilt() {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r  = card.getBoundingClientRect();
                const rx = ((e.clientY - r.top)  / r.height - .5) * -8;
                const ry = ((e.clientX - r.left) / r.width  - .5) *  8;
                card.style.transition = 'transform .12s ease, border-color .35s, box-shadow .35s';
                card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform .6s cubic-bezier(0.34,1.56,0.64,1), border-color .35s, box-shadow .35s';
                card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    /* ─── 8. CERT SHIMMER ─── */
    function initCertShimmer() {
        document.querySelectorAll('.ccard').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r  = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const sh = card.querySelector('.ccard-sh');
                if (sh) sh.style.transform = `translateX(${(px * 2 - 1) * 55}%)`;
            });
            card.addEventListener('mouseleave', () => {
                const sh = card.querySelector('.ccard-sh');
                if (sh) sh.style.transform = 'translateX(-100%)';
            });
        });
    }

    /* ─── 9. MOBILE NAV ─── */
    burger?.addEventListener('click', () => {
        burger.classList.toggle('open');
        drawer?.classList.toggle('open');
    });
    document.addEventListener('click', e => {
        if (nav && !nav.contains(e.target)) {
            burger?.classList.remove('open');
            drawer?.classList.remove('open');
        }    });

}); // end DOMContentLoaded
