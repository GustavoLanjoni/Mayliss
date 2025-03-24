require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');  // Para gerar senhas aleatórias
const multer = require('multer');  // Para o upload de arquivos (imagens)

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

// Rota para cadastro de usuário
app.post('/cadastro', async (req, res) => {
    try {
        const novoUsuario = new Usuario(req.body);
        await novoUsuario.save();
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        res.status(400).json({ message: "Erro ao cadastrar o usuário.", error });
    }
});

// Rota para pegar o número de usuários cadastrados
app.get('/usuarios', async (req, res) => {
    try {
        const usuariosCount = await Usuario.countDocuments();  // Conta o número de documentos na coleção 'Usuario'
        res.json({ usuariosCount });  // Retorna o número de usuários cadastrados
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
});
// Definir o schema do produto
const produtoSchema = new mongoose.Schema({
    nome: String,
    preco: Number,
    descricao: String,
    categoria: String,
    imagem: String,
    dataCadastro: { type: Date, default: Date.now }
});

const Produto = mongoose.model('Produto', produtoSchema);

// Definir o schema do carrinho
const carrinhoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    produtos: [
        {
            produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
            quantidade: Number
        }
    ],
    dataCriacao: { type: Date, default: Date.now }
});

const Carrinho = mongoose.model('Carrinho', carrinhoSchema);

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
        usuario.tokenRecuperacao = null;
        await usuario.save();

        res.json({ mensagem: 'Senha resetada com sucesso!' });
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        res.status(500).json({ mensagem: 'Erro ao resetar a senha.' });
    }
});

const path = require('path');  // Para trabalhar com caminhos de arquivos

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Usando caminho relativo para o diretório public/uploads
        cb(null, path.join(__dirname, 'public', 'uploads'));  // Usa __dirname para garantir o caminho correto
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Garante um nome único para o arquivo
    }
});

const upload = multer({ storage: storage });


// Rota para adicionar produtos
app.post('/api/produtos', upload.single('imagem'), async (req, res) => {
    try {
        const novoProduto = new Produto({
            nome: req.body.nome,
            preco: req.body.preco,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            imagem: req.file ? `/uploads/${req.file.filename}` : ''  // Referência da imagem no servidor
        });
        await novoProduto.save();  // Salva o produto no MongoDB
        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ message: 'Erro ao cadastrar produto.' });
    }
});

// Listar produtos por categoria
fetch('http://localhost:3000/api/produtos/Sabonetes, Cosméticos, Perfumes, Limpeza Facial, Hidratação, Tratamentos, Protetor Solar')  // Passando múltiplas categorias separadas por vírgula
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Exibe os produtos das categorias no console
  })
  .catch(error => console.error('Erro ao listar produtos:', error));


// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
