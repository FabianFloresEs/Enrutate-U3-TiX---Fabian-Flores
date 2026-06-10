// =========================
// CARRUSEL
// =========================

const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-slide');

const prevBtn = document.querySelector('.carousel-button.prev');
const nextBtn = document.querySelector('.carousel-button.next');

let currentSlide = 0;

function updateCarousel() {

    if (!track) return;

    track.style.transform =
        `translateX(-${currentSlide * 100}%)`;
}

if (nextBtn) {

    nextBtn.addEventListener('click', () => {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        updateCarousel();
    });
}

if (prevBtn) {

    prevBtn.addEventListener('click', () => {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        updateCarousel();
    });
}

// =========================
// NAVEGACIÓN HERO
// =========================

const heroLinks = document.querySelectorAll('.hero-card');

heroLinks.forEach(card => {

    card.addEventListener('click', () => {

        const targetId = card.dataset.target;

        const section = document.getElementById(targetId);

        if(section){

            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =========================
// ANIMACIÓN DE APARICIÓN
// =========================

const revealElements = document.querySelectorAll(
    '.content-section'
);

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add('visible');
            }
        });
    },

    {
        threshold: 0.15
    }

);

revealElements.forEach(section => {

    section.classList.add('hidden');
    observer.observe(section);
});

// =========================
// HEADER ACTIVO
// =========================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav a');

window.addEventListener('scroll', () => {

    let current = '';

    sections.forEach(section => {

        const top = section.offsetTop - 150;

        if(window.scrollY >= top){

            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {

        link.classList.remove('active');

        if(link.getAttribute('href') === `#${current}`){

            link.classList.add('active');
        }
    });
});

// =========================
// PARALLAX HERO (SUAVE)
// =========================

const ring = document.querySelector('.hero-ring');

window.addEventListener('mousemove', (e) => {

    if(!ring) return;

    const x = (window.innerWidth / 2 - e.clientX) / 50;
    const y = (window.innerHeight / 2 - e.clientY) / 50;

    ring.style.transform =
        `translate(${x}px, ${y}px)`;
});