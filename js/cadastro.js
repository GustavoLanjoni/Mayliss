document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value,
        nascimento: document.getElementById('nascimento').value,
        sexo: document.getElementById('sexo').value,
        cpf: document.getElementById('cpf').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            document.getElementById('formCadastro').reset();
        } else {
            alert(`Erro ao cadastrar: ${resultado.message}`);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error(error);
    }
});
