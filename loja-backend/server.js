require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');  // Para gerar senhas aleatórias

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
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definir o schema do usuário
const userSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String,
    telefone: String,
    endereco: String,
    nascimento: Date,
    sexo: String,
    cpf: { type: String, unique: true },
    dataCadastro: { type: Date, default: Date.now },
    tokenRecuperacao: String  // Campo para armazenar o token de recuperação de senha
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

// Função para gerar uma senha aleatória
function gerarSenhaAleatoria(tamanho = 10) {
    return crypto.randomBytes(tamanho).toString('hex').slice(0, tamanho);
}

// Rota para verificar se o CPF já está cadastrado
app.get('/api/verificar-cpf', async (req, res) => {
    const { cpf } = req.query;

    try {
        const usuarioExistente = await Usuario.findOne({ cpf });

        if (usuarioExistente) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        return res.status(500).json({ message: 'Erro ao verificar CPF' });
    }
});

// Rota de cadastro
app.post('/api/cadastrar', async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ cpf });

        if (usuarioExistente) {
            return res.status(400).json({ message: 'CPF já cadastrado' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(senha, salt);
        req.body.senha = hashedPassword;

        const novoUsuario = new Usuario(req.body);
        await novoUsuario.save();

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
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }
});

// Rota de login 
app.post('/api/login', async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        // Buscar o usuário no banco de dados pelo CPF
        const usuario = await Usuario.findOne({ cpf });

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        // Comparar a senha fornecida com o hash armazenado no banco de dados
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json({ mensagem: 'Senha inválida' });
        }

        // Se a senha for válida, você pode gerar um token de autenticação ou redirecionar
        // Exemplo de resposta positiva:
        res.json({ mensagem: 'Login bem-sucedido' });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro ao processar login.' });
    }
});

// Rota para recuperação de senha
app.post('/api/recuperar-senha', async (req, res) => {
    const { cpf } = req.body;

    try {
        const usuario = await Usuario.findOne({ cpf });

        if (!usuario) {
            return res.status(404).json({ mensagem: 'CPF não encontrado' });
        }

        // Gerar uma nova senha aleatória
        const novaSenha = gerarSenhaAleatoria();

        // Atualizar a senha do usuário no banco de dados
        const salt = bcrypt.genSaltSync(10);
        const senhaHash = bcrypt.hashSync(novaSenha, salt);
        usuario.senha = senhaHash;
        usuario.tokenRecuperacao = null; // Limpar o token de recuperação
        await usuario.save();

        // Enviar a nova senha por e-mail
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: usuario.email,
            subject: 'Sua nova senha',
            text: `Olá, ${usuario.nome}! Sua nova senha é: ${novaSenha}. Por favor, utilize-a para acessar sua conta.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error);
                return res.status(500).json({ mensagem: 'Erro ao enviar e-mail.' });
            } else {
                console.log('E-mail enviado: ' + info.response);
            }
        });

        res.json({ mensagem: 'Nova senha enviada por e-mail!' });
    } catch (error) {
        console.error('Erro ao processar recuperação de senha:', error);
        res.status(500).json({ mensagem: 'Erro ao processar recuperação de senha.' });
    }
});

// Rota para resetar a senha após clicar no link de recuperação
app.post('/api/resetar-senha/:token', async (req, res) => {
    const { token } = req.params;
    const { novaSenha } = req.body;

    try {
        const usuario = await Usuario.findOne({ tokenRecuperacao: token });

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Token inválido ou expirado' });
        }

        // Atualizar a senha
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(novaSenha, salt);
        usuario.senha = hashedPassword;
        usuario.tokenRecuperacao = null; // Limpar o token de recuperação
        await usuario.save();

        res.json({ mensagem: 'Senha resetada com sucesso!' });
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        res.status(500).json({ mensagem: 'Erro ao resetar a senha.' });
    }
});

// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
