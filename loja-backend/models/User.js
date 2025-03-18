const mongoose = require('mongoose');

// Definindo o esquema do usuário
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Garantir que o e-mail seja único
        match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um e-mail válido.'] // Validação de formato de e-mail
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'] // Restrição de valores válidos
    },
    cpf: {
        type: String,
        required: true,
        unique: true // Garantir que o CPF seja único
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Adiciona campos de criação e modificação automaticamente

// Criação do modelo com base no esquema
const User = mongoose.model('User', userSchema);

module.exports = User;
