let currentSlide = 0; // Índice do slide atual
        const slides = document.querySelectorAll('.slideshow .slide'); // Todos os slides
        const totalSlides = slides.length;

        // Função para mostrar o slide ativo
        function showSlide(index) {
            // Garantir que o índice esteja dentro do intervalo
            if (index >= totalSlides) {
                currentSlide = 0; // Volta para o primeiro slide
            } else if (index < 0) {
                currentSlide = totalSlides - 1; // Vai para o último slide
            } else {
                currentSlide = index;
            }

            // Esconde todos os slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Exibe o slide ativo
            slides[currentSlide].classList.add('active');
        }

        // Inicializar com o primeiro slide visível
        showSlide(currentSlide);

        // Adicionar eventos para as setas
        document.querySelector('.prev').addEventListener('click', () => {
            showSlide(currentSlide - 1); // Anterior
        });

        document.querySelector('.next').addEventListener('click', () => {
            showSlide(currentSlide + 1); // Próximo
        });
