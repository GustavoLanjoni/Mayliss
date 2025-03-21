const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: String,
    preco: Number,
    descricao: String,
    categoria: String,
    imagem: String
});

module.exports = mongoose.model('Produto', ProdutoSchema);
