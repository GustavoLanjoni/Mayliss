document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();  // Previne o comportamento padrão de enviar o formulário

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Enviar os dados para o servidor para autenticação
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        if (response.ok) {
            // Se o login for bem-sucedido, redireciona para a página inicial
            alert('Login bem-sucedido!');
            window.location.href = '/home.html';  // Substitua com sua página inicial
        } else {
            // Caso o login falhe
            alert('E-mail ou senha inválidos');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro de conexão. Tente novamente mais tarde.');
    }
});
