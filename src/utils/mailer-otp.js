const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv"); // Importa dotenv

dotenv.config(); // Carrega as variáveis de ambiente

// Verifique se as variáveis estão definidas
console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('PASS_USER:', process.env.PASS_USER ? '********' : 'Nenhuma senha definida');

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
  debug: true,   // Habilita logs de debug (use apenas em desenvolvimento)
});

// Gerar um código OTP aleatório
const generateOtp = () => {
  return crypto.randomInt(1000, 10000).toString();
};

// Enviar o OTP por e-mail
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Seu código de Verificação",
    text: `Seu código de verificação é ${otp}.`,
    html: `<strong>Seu código de verificação é ${otp}.</strong>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response); // Log do sucesso
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

// Armazenar OTPs em memória (temporário)
const otpStore = new Map();

// Armazenar OTP
const storeOtp = (email, otp) => {
  otpStore.set(email, { otp, timestamp: Date.now() });
};

// Verificar OTP
const verifyOtp = (email, otp) => {
  const storedOtp = otpStore.get(email);
  if (storedOtp) {
    const { otp: storedOtpValue, timestamp } = storedOtp;
    const currentTime = Date.now();
    // Verificar se o OTP ainda é válido (expiração de 10 minutos)
    if (currentTime - timestamp < 10 * 60 * 1000 && storedOtpValue === otp) {
      otpStore.delete(email); // Remove o OTP após a verificação
      return true;
    }
  }
  return false;
};

module.exports = { generateOtp, sendOtpEmail, storeOtp, verifyOtp };
