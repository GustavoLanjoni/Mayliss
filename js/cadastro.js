document.getElementById('formCadastro').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        telefone: formData.get('telefone'),
        endereco: formData.get('endereco'),
        nascimento: formData.get('nascimento'),
        sexo: formData.get('sexo'),
        cpf: formData.get('cpf')
    };

    // Enviar os dados para o backend
    fetch('http://localhost:5000/api/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Cadastro realizado com sucesso!');
        // Limpar o formulário ou redirecionar
    })
    .catch(error => {
        alert('Erro ao cadastrar: ' + error.message);
    });
});
