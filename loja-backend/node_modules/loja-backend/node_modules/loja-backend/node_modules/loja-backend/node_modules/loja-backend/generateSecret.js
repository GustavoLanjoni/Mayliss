const crypto = require('crypto');

function generateSecretKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

const secretKey = generateSecretKey();
console.log('Sua chave JWT gerada é:\n');
console.log(secretKey);
