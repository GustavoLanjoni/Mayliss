const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');

// Rota para adicionar ao carrinho
router.post('/adicionar-ao-carrinho', carrinhoController.adicionarAoCarrinho);

module.exports = router;
