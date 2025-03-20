document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();  // Previne o comportamento padrão de enviar o formulário

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

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
            // Login bem-sucedido com mensagem estilizada
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Login realizado com sucesso!',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = '/index.html';  // Redireciona após a mensagem
            });
        } else {
            // Erro de login com mensagem moderna
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: 'E-mail ou senha inválidos.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Tentar novamente'
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Erro de conexão!',
            text: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok'
        });
    }
});
