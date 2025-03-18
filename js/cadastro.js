document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    const nascimento = document.getElementById('nascimento').value;
    const sexo = document.getElementById('sexo').value;
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    const data = {
        name: nome,
        email,
        phone: telefone,
        address: endereco,
        birthDate: nascimento,
        gender: sexo,
        cpf,
        password: senha
    };

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = "login.html"; // Se você tiver uma tela de login
        } else {
            alert('Erro no cadastro: ' + result.message);
        }
    } catch (error) {
        alert('Erro na comunicação com o servidor.');
        console.error(error);
    }
});
