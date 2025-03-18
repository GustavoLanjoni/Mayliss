const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const User = require('./models/User');

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:5500' // Altere para o IP do seu front, se necessário
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado ao MongoDB com sucesso!'))
    .catch(err => console.log('Erro ao conectar ao MongoDB: ', err));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Você pode usar outro serviço, como Outlook ou Yahoo
    auth: {
        user: process.env.EMAIL_USER, // Coloque seu e-mail aqui
        pass: process.env.EMAIL_PASS // Coloque sua senha aqui ou use variáveis de ambiente
    }
});

// Função para enviar e-mail de boas-vindas
const sendWelcomeEmail = (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // E-mail de origem
        to: email, // E-mail do usuário
        subject: 'Cadastro realizado com sucesso!',
        text: `Olá ${name},\n\nSeu cadastro foi realizado com sucesso. Seja bem-vindo!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar e-mail:', error);
        } else {
            console.log('E-mail enviado: ' + info.response);
        }
    });
};

// Rota de cadastro
app.post('/api/register', async (req, res) => {
    const { name, email, phone, address, birthDate, gender, cpf, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
        if (existingUser) {
            return res.status(400).json({ message: 'E-mail ou CPF já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            phone,
            address,
            birthDate,
            gender,
            cpf,
            password: hashedPassword
        });

        await newUser.save();

        // Enviar e-mail de boas-vindas
        sendWelcomeEmail(email, name);

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err.message });
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Senha incorreta.' });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login realizado com sucesso.', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no login', error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
