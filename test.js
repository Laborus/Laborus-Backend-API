const bcrypt = require("bcrypt");

const hash = "$2b$10$EaMq6CKWeLUmUXp4n20FSegHUZMMdVPq2Shesz01vU3r..5vBirvK"; // Substitua pelo novo hash gerado
const senha = "senha123";

bcrypt.compare(senha, hash, (err, result) => {
  if (err) {
    console.error("Erro ao comparar:", err);
  } else {
    console.log("A senha é válida?", result); // Deve retornar true se o hash estiver correto
  }
});
