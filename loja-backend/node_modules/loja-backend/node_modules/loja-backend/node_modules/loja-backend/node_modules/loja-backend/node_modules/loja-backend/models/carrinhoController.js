const Carrinho = require('../models/carrinho');

exports.adicionarAoCarrinho = async (req, res) => {
    const { usuarioId, produtoId, quantidade } = req.body;
    
    try {
        let carrinho = await Carrinho.findOne({ usuarioId });

        if (!carrinho) {
            carrinho = new Carrinho({ usuarioId, produtos: [] });
        }

        const produtoExistente = carrinho.produtos.find(p => p.produtoId.toString() === produtoId);
        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            carrinho.produtos.push({ produtoId, quantidade });
        }

        await carrinho.save();
        res.status(200).json({ message: 'Produto adicionado ao carrinho com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar ao carrinho' });
    }
};
