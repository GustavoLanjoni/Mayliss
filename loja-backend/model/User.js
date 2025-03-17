const mongoose = require('mongoose');

// Definindo o esquema do usuário
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  cpf: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Criando o modelo do usuário
const User = mongoose.model('User', userSchema);

module.exports = User;
