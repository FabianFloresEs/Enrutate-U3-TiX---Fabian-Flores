/* ================================= */
/* CARRUSEL ACERCA DEL JUEGO */
/* ================================= */

const slides = document.querySelectorAll('.carousel-slide');

const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

let currentSlide = 0;

function showSlide(index){

    slides.forEach(slide=>{
        slide.classList.remove('active');
    });

    slides[index].classList.add('active');

}

if(nextBtn && prevBtn){

    nextBtn.addEventListener('click',()=>{

        currentSlide++;

        if(currentSlide >= slides.length){

            currentSlide = 0;

        }

        showSlide(currentSlide);

    });

    prevBtn.addEventListener('click',()=>{

        currentSlide--;

        if(currentSlide < 0){

            currentSlide = slides.length - 1;

        }

        showSlide(currentSlide);

    });

}

showSlide(0);

/* ================================= */
/* APARICIÓN DE SECCIONES */
/* ================================= */

const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add('visible');

            }

        });

    },

    {
        threshold:0.15
    }

);

sections.forEach(section=>{

    section.classList.add('hidden');

    observer.observe(section);

});

