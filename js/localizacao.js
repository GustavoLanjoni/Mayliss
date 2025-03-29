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

        // Opcional: Preencher o campo de endereço completo com o endereço formatado
        document.getElementById('endereco').value = enderecoCompleto;

        // Se precisar de outros campos, você pode preenchê-los separadamente
        console.log('Rua:', rua);
        console.log('Cidade:', cidade);
        console.log('Estado:', estado);
    });
}

// Inicializa o autocomplete quando a página for carregada
google.maps.event.addDomListener(window, 'load', initAutocomplete);
