const carousel = document.querySelector('.carousel');
const prevButton = document.querySelector('.carousel-navigation .prev');
const nextButton = document.querySelector('.carousel-navigation .next');

let scrollAmount = 0;
const scrollStep = 300; // A quantidade de pixels que a tela vai mover a cada clique na seta

// Função para mover o carrossel para a esquerda
prevButton.addEventListener('click', () => {
    if (scrollAmount > 0) {
        scrollAmount -= scrollStep;
    } else {
        scrollAmount = carousel.scrollWidth - carousel.offsetWidth;
    }
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
});

// Função para mover o carrossel para a direita
nextButton.addEventListener('click', () => {
    if (scrollAmount < carousel.scrollWidth - carousel.offsetWidth) {
        scrollAmount += scrollStep;
    } else {
        scrollAmount = 0;
    }
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
});

// Função para arrastar
let isDragging = false;
let startX, scrollLeft;

const carouselContainer = document.querySelector('.carousel-container');

carouselContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - carouselContainer.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carouselContainer.style.cursor = 'grabbing'; // Muda o cursor quando começa a arrastar
});

carouselContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    carouselContainer.style.cursor = 'grab'; // Retorna o cursor quando sai da área
});

carouselContainer.addEventListener('mouseup', () => {
    isDragging = false;
    carouselContainer.style.cursor = 'grab'; // Retorna o cursor ao soltar o clique
});

carouselContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const moveX = e.pageX - carouselContainer.offsetLeft;
    const distance = (moveX - startX) * 2; // Multiplicador para maior controle da velocidade de arraste
    carousel.scrollLeft = scrollLeft - distance;
});

// Função de toque para dispositivos móveis
carouselContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - carouselContainer.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carouselContainer.style.cursor = 'grabbing';
});

carouselContainer.addEventListener('touchend', () => {
    isDragging = false;
    carouselContainer.style.cursor = 'grab';
});

carouselContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const moveX = e.touches[0].pageX - carouselContainer.offsetLeft;
    const distance = (moveX - startX) * 2;
    carousel.scrollLeft = scrollLeft - distance;
});
