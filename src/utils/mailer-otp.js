// const crypto = require("crypto");
// const dotenv = require("dotenv"); // Importa dotenv
// const Student = require("../models/student.model");
// const School = require("../models/school.model");
// const Company = require("../models/company.model");
// const { sendResetEmail } = require("../controllers/forgot-pass.controller"); // Importa a função

// dotenv.config(); // Carrega as variáveis de ambiente

// // Armazenar tokens de redefinição (temporário)
// const resetTokenStore = new Map();

// // Gera um token de redefinição
// const generateResetToken = (userId) => {
//   return crypto.randomBytes(20).toString("hex");
// };

// // Armazenar token de redefinição de senha
// const storeResetToken = (email, token) => {
//   resetTokenStore.set(email, { token, timestamp: Date.now() });
// };

// // Verificar token de redefinição
// const verifyResetToken = (email, token) => {
//   const storedToken = resetTokenStore.get(email);
//   if (storedToken) {
//     const { token: storedTokenValue, timestamp } = storedToken;
//     const currentTime = Date.now();
//     // Verificar se o token ainda é válido (expiração de 1 hora)
//     if (
//       currentTime - timestamp < 1 * 60 * 60 * 1000 &&
//       storedTokenValue === token
//     ) {
//       resetTokenStore.delete(email); // Remove o token após a verificação
//       return true;
//     }
//   }
//   return false;
// };

// const forgotPassword = async (email) => {
//   // Verifica se o usuário existe em qualquer uma das coleções (Student, School, Company)
//   let user = await Student.findOne({ email });

//   if (!user) {
//     user = await School.findOne({ email });
//   }

//   if (!user) {
//     user = await Company.findOne({ email });
//   }

//   // Se o usuário não for encontrado, lança um erro
//   if (!user) {
//     throw new Error("Usuário não encontrado");
//   }

//   // Gera um token de redefinição de senha
//   const resetToken = generateResetToken(user._id.toString());

//   // Armazena o token de redefinição
//   storeResetToken(email, resetToken);

//   // Envia o e-mail com o token de redefinição
//   await sendResetEmail(email, resetToken);

//   console.log("Email de redefinição de senha enviado para:", email);
// };

// module.exports = {
//   generateResetToken,
//   forgotPassword,
//   verifyResetToken,
// };
