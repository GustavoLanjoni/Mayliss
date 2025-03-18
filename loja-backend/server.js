const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');  // Importando o modelo de usuário

dotenv.config(); // Carrega variáveis de ambiente do arquivo .env

const app = express();
const port = 5000;

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

// Habilitando o CORS para permitir requisições do seu front-end específico
app.use(cors({
  origin: 'http://127.0.0.1:5500' // Substitua pela URL do seu front-end
}));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch(err => console.log('Erro ao conectar ao MongoDB: ', err));

// Rota para cadastrar um novo usuário
app.post('/api/register', async (req, res) => {
  const { name, email, phone, address, birthDate, gender, cpf, password } = req.body;

  try {
    // Verificando se o e-mail ou CPF já estão cadastrados
    const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail ou CPF já está em uso.' });
    }

    // Criptografando a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criando e salvando o novo usuário
    const newUser = new User({
      name,
      email,
      phone,
      address,
      birthDate,
      gender,
      cpf,
      password: hashedPassword,   // <- Corrigido aqui
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err.message });
  }
});


// Rota para login de um usuário
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;  // password recebido aqui

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verificando a senha
    const isPasswordCorrect = await bcrypt.compare(password, user.password);  // usa password
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login bem-sucedido!', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no login', error: err.message });
  }
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
