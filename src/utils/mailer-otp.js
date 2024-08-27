const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use false para TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.PASS_USER,
  },
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
    await transporter.sendMail(mailOptions);
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
