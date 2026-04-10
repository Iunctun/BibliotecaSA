const projects = [
    {
        carouselId: 'carousel1',
        dotsId: 'dots1',
        images: [
            '../img/livro1.webp',
            '../img/livro2.webp',
            '../img/livro3.webp',
            '../img/livro4.webp',
            '../img/livro7.webp',
            '../img/livro5.webp',
            '../img/livro6.webp',
            '../img/livro7.webp',
            '../img/livro1.webp',
            '../img/livro2.webp',
        ]
    },
    {
        carouselId: 'carousel2',
        dotsId: 'dots2',
        images: [
            '../img/livro4.webp',
            '../img/livro7.webp',
            '../img/livro2.webp',
            '../img/livro3.webp',
            '../img/livro6.webp',
            '../img/livro7.webp',
            '../img/livro3.webp',
            '../img/livro6.webp',
            '../img/livro3.webp',
            '../img/livro6.webp',
        ]
    }
];

class Carousel {
    constructor(carouselId, dotsId, images) {
        this.carouselElement = document.getElementById(carouselId);
        this.dotsElement = document.getElementById(dotsId);
        this.images = images;
        this.currentSlide = 0;
        this.totalSlides = Math.ceil(images.length / 5);
        this.init();
    }

    init() {
        this.createDots();
        this.showSlide(0);
    }

    createDots() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsElement.appendChild(dot);
        }
    }

    showSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.carouselElement.innerHTML = '';

        const startIndex = slideIndex * 5;
        const endIndex = Math.min(startIndex + 5, this.images.length);

        for (let i = startIndex; i < endIndex; i++) {
            const imageBox = document.createElement('div');
            imageBox.classList.add('image-box');

            const img = document.createElement('img');
            img.src = this.images[i];
            img.alt = `Imagem ${i + 1}`;

            imageBox.appendChild(img);
            this.carouselElement.appendChild(imageBox);
        }

        this.updateDots();
    }

    updateDots() {
        const dots = this.dotsElement.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    goToSlide(slideIndex) {
        this.showSlide(slideIndex);
    }
}

// ← função global, chamada pelo include.js após injetar o HTML
function initCarousels() {
    projects.forEach(project => {
        const carouselEl = document.getElementById(project.carouselId);
        const dotsEl = document.getElementById(project.dotsId);

        if (!carouselEl || !dotsEl) {
            console.warn(`Elemento não encontrado: ${project.carouselId} ou ${project.dotsId}`);
            return;
        }

        new Carousel(project.carouselId, project.dotsId, project.images);
    });
}