require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// Definir o schema do usuário
const userSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String,
    telefone: String,
    endereco: String,
    nascimento: Date,
    sexo: String,
    cpf: { type: String, unique: true }, // Garantir que o CPF seja único
    dataCadastro: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', userSchema);

// Configurar envio de e-mail com Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rota para verificar se o CPF já está cadastrado
app.get('/api/verificar-cpf', async (req, res) => {
    const { cpf } = req.query;

    try {
        // Verificar se o CPF já existe no banco de dados
        const usuarioExistente = await Usuario.findOne({ cpf });

        if (usuarioExistente) {
            return res.json({ exists: true }); // CPF já cadastrado
        } else {
            return res.json({ exists: false }); // CPF disponível para cadastro
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao verificar CPF' });
    }
});

// Rota de cadastro
app.post('/api/cadastrar', async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        // Verificar se o CPF já está cadastrado
        const usuarioExistente = await Usuario.findOne({ cpf });
        
        if (usuarioExistente) {
            return res.status(400).json({ message: 'CPF já cadastrado' });
        }

        // Hash da senha para garantir que seja armazenada de forma segura
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(senha, salt);
        req.body.senha = hashedPassword;

        // Criar o novo usuário
        const novoUsuario = new Usuario(req.body);
        await novoUsuario.save();

        // Enviar e-mail de boas-vindas
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: novoUsuario.email,
            subject: 'Bem-vindo ao nosso sistema!',
            text: `Olá, ${novoUsuario.nome}! Sua conta foi criada com sucesso. Seja bem-vindo(a)!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error);
            } else {
                console.log('E-mail enviado: ' + info.response);
            }
        });

        res.status(201).json({ message: 'Usuário cadastrado e e-mail enviado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
