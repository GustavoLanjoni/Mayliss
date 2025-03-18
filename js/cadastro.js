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
        nome,
        email,
        telefone,
        endereco,
        nascimento,
        sexo,
        cpf,
        senha
    };

    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });


    const result = await response.json();
    if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        // Redirecionar para a página de login ou outra página
    } else {
        alert('Erro no cadastro: ' + result.message);
    }
});
