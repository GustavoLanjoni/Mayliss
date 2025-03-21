// Você pode adicionar interatividade com JS, caso queira que o menu se abra
// ao clicar em vez de apenas ao passar o mouse.
document.querySelectorAll('.dropdown > a').forEach(item => {
    item.addEventListener('click', function(event) {
      const submenu = this.nextElementSibling;
      submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
      event.preventDefault();
    });
  });

