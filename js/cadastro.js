document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    const nascimento = document.getElementById('nascimento').value;
    const sexo = document.getElementById('sexo').value;
    const cpf = document.getElementById('cpf').value;

    // Verificar maioridade
    const idade = calcularIdade(nascimento);
    if (idade < 18) {
        Swal.fire({
            icon: 'error',
            title: 'Você precisa ser maior de idade',
            text: 'Não é possível realizar o cadastro para menores de 18 anos.',
            confirmButtonText: 'Ok'
        });
        return;
    }

    // Verificar se o CPF já está cadastrado
    try {
        const responseCpf = await fetch(`http://localhost:3000/api/verificar-cpf?cpf=${cpf}`);
        const cpfExiste = await responseCpf.json();

        if (cpfExiste.exists) {
            Swal.fire({
                icon: 'error',
                title: 'CPF já cadastrado',
                text: 'Este CPF já está associado a uma conta. Não é possível cadastrar novamente.',
                confirmButtonText: 'Tentar novamente'
            });
            return;
        }

        // Se o CPF não existir, enviar o formulário para cadastro
        const usuario = {
            nome,
            email,
            senha,
            telefone,
            endereco,
            nascimento,
            sexo,
            cpf
        };

        const response = await fetch('http://localhost:3000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        const text = await response.text();  // Pega a resposta como texto
        console.log(text);  // Imprime a resposta para ver o que o servidor retorna

        let resultado;
        try {
            resultado = JSON.parse(text);  // Tenta converter para JSON
        } catch (error) {
            console.error('Erro ao tentar converter para JSON:', error);
        }
        
        if (resultado && response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado com sucesso!',
                text: 'O cadastro foi feito com sucesso.',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/login.html'; // Redireciona para a página de login
                }
            });
            document.getElementById('formCadastro').reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar',
                text: resultado.message || 'Não foi possível realizar o cadastro.',
                confirmButtonText: 'Tentar novamente'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: 'Houve um erro ao tentar se conectar com o servidor. Tente novamente mais tarde.',
            confirmButtonText: 'Ok'
        });
        console.error(error);
    }
});

// Função para calcular a idade com base na data de nascimento
function calcularIdade(nascimento) {
    const dataNascimento = new Date(nascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const m = hoje.getMonth() - dataNascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
        idade--;
    }
    return idade;
}
