// Função para enviar o formulário com a foto do usuário
document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData();
    const foto = document.getElementById('foto').files[0];
    
    if (foto) {
        formData.append('foto', foto);

        // Atualizar a imagem da foto do perfil (bola)
        const reader = new FileReader();
        reader.onload = function () {
            document.getElementById('profile-photo').src = reader.result;
        };
        reader.readAsDataURL(foto);

        // Aqui você faria uma requisição para o back-end para salvar a imagem
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Foto de perfil atualizada com sucesso!');
            console.log(data);
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao atualizar foto de perfil');
        });
    }
});

// Função para atualizar a foto na bola ao selecionar uma nova imagem
document.getElementById('foto').addEventListener('change', function (e) {
    const foto = e.target.files[0];

    if (foto) {
        const reader = new FileReader();
        reader.onload = function () {
            // Atualizando o src da imagem na bola
            document.getElementById('profile-photo').src = reader.result;
        };
        reader.readAsDataURL(foto);
    }
});

// Função do Google Places Autocomplete para preencher o campo de endereço
function initAutocomplete() {
    // Referência ao campo de entrada de endereço
    const input = document.getElementById('endereco');

    // Inicializando o autocomplete do Google Places
    const autocomplete = new google.maps.places.Autocomplete(input);

    // Definindo os campos que queremos retornar (pode ser ajustado conforme necessário)
    autocomplete.setFields(['address_components', 'formatted_address']);

    // Quando o usuário selecionar um endereço da lista
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();

        // Se não houver detalhes do endereço, sai da função
        if (!place.address_components) {
            return;
        }

        // Aqui vamos pegar o endereço completo e os componentes
        let enderecoCompleto = place.formatted_address;  // Endereço completo

        // Você pode acessar os componentes específicos (rua, cidade, estado, etc.)
        let rua = '';
        let cidade = '';
        let estado = '';
        place.address_components.forEach(function(component) {
            const types = component.types;

            if (types.includes('route')) { // Rua
                rua = component.long_name;
            } else if (types.includes('locality')) { // Cidade
                cidade = component.long_name;
            } else if (types.includes('administrative_area_level_1')) { // Estado
                estado = component.long_name;
            }
        });

        // Preencher o campo de endereço completo com o endereço formatado
        document.getElementById('endereco').value = enderecoCompleto;

        // Opcional: Preencher outros campos com informações específicas
        console.log('Rua:', rua);
        console.log('Cidade:', cidade);
        console.log('Estado:', estado);
    });
}

// Inicializa o autocomplete quando a página for carregada
google.maps.event.addDomListener(window, 'load', initAutocomplete);