const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv"); // Importa dotenv

dotenv.config(); // Carrega as variáveis de ambiente

// Verifique se as variáveis estão definidas
console.log("MAIL_USER:", process.env.MAIL_USER);
console.log(
  "PASS_USER:",
  process.env.PASS_USER ? "" : "Nenhuma senha definida"
);

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use false para TLS (porta 587)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.PASS_USER,
  },
  logger: true, // Habilita logs detalhados (use apenas em desenvolvimento)
  debug: true, // Habilita logs de debug (use apenas em desenvolvimento)
});

// Enviar o token de redefinição de senha por e-mail
const sendResetEmail = async (email, token) => {
  const resetLink = `http://your-frontend-url/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Redefinição de Senha",
    text: `Você solicitou a redefinição de sua senha. Clique no link a seguir para redefinir sua senha: ${resetLink}`,
    html: `<strong>Você solicitou a redefinição de sua senha.</strong><br> Clique no link a seguir: <a href="${resetLink}">Redefinir senha</a>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response); // Log do sucesso
  } catch (error) {
    console.error("Erro ao enviar o email:", error);
    throw new Error("Erro ao enviar o email");
  }
};

// Armazenar tokens de redefinição (temporário)
const resetTokenStore = new Map();

// Armazenar token de redefinição de senha
const storeResetToken = (email, token) => {
  resetTokenStore.set(email, { token, timestamp: Date.now() });
};

// Verificar token de redefinição
const verifyResetToken = (email, token) => {
  const storedToken = resetTokenStore.get(email);
  if (storedToken) {
    const { token: storedTokenValue, timestamp } = storedToken;
    const currentTime = Date.now();
    // Verificar se o token ainda é válido (expiração de 1 hora)
    if (
      currentTime - timestamp < 1 * 60 * 60 * 1000 &&
      storedTokenValue === token
    ) {
      resetTokenStore.delete(email); // Remove o token após a verificação
      return true;
    }
  }
  return false;
};

const forgotPassword = async (email) => {
  // Verifica se o usuário existe em qualquer uma das coleções (Student, School, Company)
  let user = await Student.findOne({ email });

  if (!user) {
    user = await School.findOne({ email });
  }

  if (!user) {
    user = await Company.findOne({ email });
  }

  // Se o usuário não for encontrado, lança um erro
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Gera um token de redefinição de senha
  const resetToken = generateResetToken(user._id.toString());

  // Envia o e-mail com o token de redefinição
  await sendResetEmail(email, resetToken);

  console.log("Email de redefinição de senha enviado para:", email);
};

module.exports = {
  generateResetToken,
  sendResetEmail,
  forgotPassword,
  verifyResetToken,
};
