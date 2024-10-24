const mongoose = require("mongoose");
const axios = require("axios");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");
const { validationErrorWithData } = require("../utils/api.response");
const bcrypt = require("bcrypt");

// Função para validar CPF
function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// Função para validar CNPJ
function isValidCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, "");

  if (cnpj.length !== 14) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
}

// Função para consultar o CNPJ na ReceitaWS
async function verifyCNPJInReceitaWS(cnpj) {
  try {
    const response = await axios.get(
      `https://receitaws.com.br/v1/cnpj/${cnpj}`
    );
    return response.data.status === "OK";
  } catch (error) {
    throw new Error("Failed to validate CNPJ with ReceitaWS.");
  }
}

function validate(schema) {
  return async (req, res, next) => {
    const { body } = req;
    const errors = [];

    Object.keys(schema.obj).forEach((field) => {
      const fieldSchema = schema.obj[field];
      const value = body[field];

      if (fieldSchema.required && (!value || value.length === 0)) {
        errors.push(fieldSchema.required[1] || `${field} is required.`);
      }

      if (fieldSchema.min && value && value.length < fieldSchema.min[0]) {
        errors.push(
          fieldSchema.min[1] ||
            `${field} must be at least ${fieldSchema.min[0]} characters.`
        );
      }

      if (fieldSchema.max && value && value.length > fieldSchema.max[0]) {
        errors.push(
          fieldSchema.max[1] ||
            `${field} must not exceed ${fieldSchema.max[0]} characters.`
        );
      }

      if (fieldSchema.match && value && !fieldSchema.match[0].test(value)) {
        errors.push(
          fieldSchema.match[1] || `${field} is not in the correct format.`
        );
      }

      if (fieldSchema.enum && value && !fieldSchema.enum.includes(value)) {
        errors.push(fieldSchema.enumErrorMessage || `${field} is not valid.`);
      }
    });

    // Validação específica para CPF
    if (schema.path("cpf") && body.cpf && !isValidCPF(body.cpf)) {
      errors.push("Invalid CPF.");
    }

    // Validação específica para CNPJ
    if (schema.path("cnpj") && body.cnpj) {
      if (!isValidCNPJ(body.cnpj)) {
        errors.push("Invalid CNPJ.");
      } else {
        try {
          const isCNPJValid = await verifyCNPJInReceitaWS(body.cnpj);
          if (!isCNPJValid) {
            return validationErrorWithData(
              res,
              "CNPJ not found in ReceitaWS.",
              { cnpj: body.cnpj }
            );
          }
        } catch (error) {
          return validationErrorWithData(res, error.message, {
            cnpj: body.cnpj,
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "FAILED",
        error: "VALIDATION_ERROR",
        message: "Validation failed.",
        errors,
        data: {
          ...body, // Include the entire request body in the error response
        },
      });
    }

    return next();
  };
}

function getSchemaForAccountType(accountType) {
  switch (accountType) {
    case "Student":
      return Student.schema;
    case "School":
      return School.schema;
    case "Company":
      return Company.schema;
    default:
      return User.schema; // Fallback to User schema or handle accordingly
  }
}

const validateUser = (req, res, next) => {
  const { accountType } = req.body;
  const schema = getSchemaForAccountType(accountType);

  if (!schema) {
    return res.status(400).json({
      status: "FAILED",
      error: "VALIDATION_ERROR",
      message: "Invalid account type provided.",
    });
  }

  return validate(schema)(req, res, next);
};

async function checkDuplicateUser(req, res, next) {
  try {
    const { email, cpf, cnpj } = req.body;

    // Verificar se o e-mail já está cadastrado em qualquer uma das coleções
    let existingUser =
      (await Student.findOne({ email })) ||
      (await School.findOne({ email })) ||
      (await Company.findOne({ email }));

    if (existingUser) {
      return validationErrorWithData(res, "Email is already registered.", {
        email,
      });
    }

    // Verificar duplicidade de CPF (se aplicável)
    if (cpf) {
      existingUser = await Student.findOne({ cpf });
      if (existingUser) {
        return validationErrorWithData(res, "CPF is already registered.", {
          cpf,
        });
      }
    }

    // Verificar duplicidade de CNPJ (se aplicável)
    if (cnpj) {
      existingUser =
        (await School.findOne({ cnpj })) || (await Company.findOne({ cnpj }));
      if (existingUser) {
        return validationErrorWithData(res, "CNPJ is already registered.", {
          cnpj,
        });
      }
    }

    // Se não houver duplicidades, prossiga
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error checking for duplicate user.",
      error: error.message,
    });
  }
}

module.exports = { validateUser, checkDuplicateUser };
