// JavaScript para alterar a imagem ao passar o mouse
document.querySelectorAll('.productsLink').forEach(product => {
    product.addEventListener('mouseenter', () => {
        let img = product.querySelector('.product-image');
        img.src = "img/saboneteT2_hover.png"; // Substitua o caminho pela imagem que deve aparecer ao passar o mouse
    });

    product.addEventListener('mouseleave', () => {
        let img = product.querySelector('.product-image');
        img.src = "img/saboneteT2.png"; // Retorna a imagem original quando o mouse sai
    });
});
