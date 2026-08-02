const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('#site-header');
const menuButton = document.querySelector('#menu-button');
const mobileNav = document.querySelector('#mobile-nav');
const mobileLinks = mobileNav.querySelectorAll('a');
const revealElements = document.querySelectorAll('.reveal-on-scroll');
const heroVideo = document.querySelector('.hero-video');

document.documentElement.classList.add('js');

function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open navigation menu';
    mobileNav.hidden = true;
    if (restoreFocus) menuButton.focus();
}

function openMenu() {
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.querySelector('.sr-only').textContent = 'Close navigation menu';
    mobileNav.hidden = false;
    mobileNav.querySelector('a').focus();
}

menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    if (opening) openMenu();
    else closeMenu();
});

mobileLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
});

if (prefersReducedMotion.matches) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.16 });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
}

function updateVideoPlayback() {
    if (!heroVideo) return;
    if (prefersReducedMotion.matches || document.hidden) {
        heroVideo.pause();
        return;
    }
    heroVideo.play().catch(() => {});
}

document.addEventListener('visibilitychange', updateVideoPlayback);

updateHeader();
updateVideoPlayback();
