// Importando pacotes necessários
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Criando o app Express
const app = express();

// Usando o JSON para requisições
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
  })
  .catch((error) => {
    console.log('Erro ao conectar ao MongoDB:', error);
  });

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

//cadastro
app.post('/api/cadastrar', async (req, res) => {
  const { nome, email, senha, telefone, endereco, nascimento, sexo, cpf } = req.body;

  if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
      const usuarioExiste = await User.findOne({ email });
      if (usuarioExiste) {
          return res.status(400).json({ message: 'Usuário já cadastrado.' });
      }

      const novoUsuario = new User({
          nome,
          email,
          senha,
          telefone,
          endereco,
          nascimento,
          sexo,
          cpf
      });

      await novoUsuario.save();
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro no servidor.' });
  }
});

