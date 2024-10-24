const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.PASS_USER,
  },
  tls: {
    rejectUnauthorized: false, // Ignora a verificação de certificado
  },
  logger: true,
  debug: true,
});

// Função para enviar o e-mail de redefinição
const sendResetEmail = async (email, token) => {
  const resetLink = `http://your-frontend-url/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Redefinição de Senha",
    text: `Você solicitou a redefinição de sua senha. Clique no link a seguir para redefinir sua senha: ${resetLink}`,
    html: `<strong>Você solicitou a redefinição de sua senha.</strong><br> Clique no link a seguir: <a href="${resetLink}">Redefinir senha</a>`,
  };

  await transporter.sendMail(mailOptions);
};

// Gera um token de redefinição
const generateResetToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

// Expondo as funções para uso em outras partes do aplicativo
module.exports = {
  sendResetEmail,
  generateResetToken,
};
