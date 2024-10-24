const Challenge = require("../models/challenge.model");
const School = require("../models/school.model"); // Ajuste o caminho conforme necessário
const {
  validationErrorWithData,
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.resolve(__dirname, "../uploads/others"); // Caminho relativo a partir de 'controllers'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Cria o nome do arquivo com o prefixo "Laborus-File" e a extensão original
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `Laborus-File-${uniqueSuffix}`); // Formato final do nome do arquivo
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limite de 3MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx/; // Tipos de arquivo permitidos
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Arquivo deve ser um documento ou apresentação"));
    }
  },
}).single("file");

const checkSchoolUser = async (req, res) => {
  // Verifique se o ID do usuário está presente no token JWT
  const userId = req.userId; // Supondo que o ID do usuário esteja disponível aqui

  try {
    const schoolUser = await School.findById(userId);
    if (!schoolUser) {
      return errorResponse(
        res,
        "Acesso negado. Apenas escolas podem realizar esta operação."
      );
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Erro ao verificar usuário escolar.");
  }
};

exports.createChallenge = async (req, res) => {
  // Verifica se o usuário é do tipo "school"
  try {
    await checkSchoolUser(req, res); // Verifica se o usuário é do tipo "school"
  } catch (error) {
    return errorResponse(res, error.message); // Retorna a mensagem de erro se a verificação falhar
  }

  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err); // Log de erro de upload
      return errorResponse(res, err);
    }

    try {
      console.log("Request body:", req.body); // Log do corpo da requisição
      console.log("File info:", req.file); // Log das informações do arquivo

      const { title, course, points, instructions, difficulty } = req.body;

      // Verifique se todos os campos necessários estão preenchidos
      if (!title || !course || !points || !instructions || !difficulty) {
        return validationErrorWithData(
          res,
          "Todos os campos são obrigatórios.",
          {}
        );
      }

      const schoolId = req.userId; // Assumindo que o ID da escola está no token JWT

      const newChallenge = new Challenge({
        title,
        course,
        points,
        instructions,
        difficulty,
        file: { data: req.file.path, contentType: req.file.mimetype },
        school: schoolId,
      });

      await newChallenge.save();
      console.log("New challenge created:", newChallenge); // Log do desafio criado

      return successResponseWithData(
        res,
        "Desafio criado com sucesso!",
        newChallenge
      );
    } catch (error) {
      console.error("Error creating challenge:", error); // Log do erro
      return errorResponse(res, "INTERNAL_SERVER_ERROR");
    }
  });
};

// Listar desafios por curso
exports.challengesByCourse = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      course: req.params.courseId,
    }).populate("school");
    return successResponseWithData(
      res,
      "Desafios do curso recuperados com sucesso.",
      challenges
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Baixar o arquivo do desafio
exports.getChallengeFile = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge || !challenge.file) {
      return errorResponse(res, "Arquivo do desafio não encontrado.");
    }
    res.setHeader("Content-Type", challenge.file.contentType);
    res.sendFile(challenge.file.data);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Buscar desafio por ID
exports.challengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      "course school"
    );
    if (!challenge) {
      return errorResponse(res, "Desafio não encontrado.");
    }
    return successResponseWithData(res, "Desafio encontrado.", challenge);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Listar todos os desafios
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().populate("course school");

    // Contagem de desafios
    const totalChallenges = challenges.length;

    return successResponseWithData(
      res,
      "Desafios recuperados com sucesso.",
      { totalChallenges, challenges } // Envia a lista de desafios e a contagem
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Desafios por Dificuldade

exports.getChallengesByDifficulty = async (req, res) => {
  try {
    // Obtem a dificuldade a partir do query param, ex: ?difficulty=Medium
    const { difficulty } = req.query;

    // Verifica se o parâmetro foi fornecido
    if (!difficulty) {
      return errorResponse(
        res,
        "BAD_REQUEST",
        "O parâmetro 'difficulty' é obrigatório."
      );
    }

    // Busca desafios pela dificuldade fornecida
    const challenges = await Challenge.find({ difficulty }).populate(
      "course school"
    );

    // Contagem de desafios encontrados para essa dificuldade
    const totalChallenges = challenges.length;

    return successResponseWithData(
      res,
      `Desafios de dificuldade ${difficulty} recuperados com sucesso.`,
      { challenges, totalChallenges }
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

exports.getChallengesByDifficulty = async (req, res) => {
  try {
    // Obtem a dificuldade a partir do query param, ex: ?difficulty=Medium
    const { difficulty } = req.query;

    // Verifica se o parâmetro foi fornecido
    if (!difficulty) {
      return errorResponse(
        res,
        "BAD_REQUEST",
        "O parâmetro 'difficulty' é obrigatório."
      );
    }

    // Busca desafios pela dificuldade fornecida
    const challenges = await Challenge.find({ difficulty }).populate(
      "course school"
    );

    // Contagem de desafios encontrados para essa dificuldade
    const totalChallenges = challenges.length;

    // Retorna a resposta com a dificuldade, lista de desafios e contagem
    return successResponseWithData(
      res,
      `Desafios de dificuldade ${difficulty} recuperados com sucesso.`,
      {
        difficulty, // Inclui o nível de dificuldade
        totalChallenges,
        challenges,
      }
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Contar desafios
exports.countChallenges = async (req, res) => {
  try {
    const count = await Challenge.countDocuments();
    return successResponseWithData(res, "Contagem de desafios.", { count });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Listar desafios por usuário (school)
exports.challengesByUser = async (req, res) => {
  try {
    const challenges = await Challenge.find({ school: req.user._id }).populate(
      "course"
    );
    return successResponseWithData(
      res,
      "Desafios da escola recuperados com sucesso.",
      challenges
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Atualizar um desafio
exports.updateChallenge = async (req, res) => {
  checkSchoolUser(req, res); // Verifica se o usuário é do tipo "school"

  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, err);
    }

    try {
      const challengeId = req.params.id;
      const updateData = req.body;

      if (
        updateData.instructions &&
        updateData.instructions.split(" ").length > 200
      ) {
        return validationErrorWithData(
          res,
          "As instruções não podem exceder 200 palavras.",
          {}
        );
      }

      // Verifica se um novo arquivo foi enviado
      if (req.file) {
        updateData.file = {
          data: req.file.path,
          contentType: req.file.mimetype,
        };
      }

      const updatedChallenge = await Challenge.findByIdAndUpdate(
        challengeId,
        updateData,
        { new: true }
      );
      if (!updatedChallenge) {
        return errorResponse(res, "Desafio não encontrado.");
      }

      return successResponseWithData(
        res,
        "Desafio atualizado com sucesso!",
        updatedChallenge
      );
    } catch (error) {
      console.error(error);
      return errorResponse(res, "INTERNAL_SERVER_ERROR");
    }
  });
};

// Deletar um desafio
exports.deleteChallenge = async (req, res) => {
  checkSchoolUser(req, res); // Verifica se o usuário é do tipo "school"

  try {
    const challengeId = req.params.id;
    const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);
    if (!deletedChallenge) {
      return errorResponse(res, "Desafio não encontrado.");
    }
    return successResponseWithData(res, "Desafio deletado com sucesso!");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// exports.challengeSubmit = (req, res) => {};

// exports.challengeSolved = (req, res) => {};

// exports.solvedList = (req, res) => {};

// exports.pointsChallenges = (req, res) => {};

// exports.progressChallenges = (req, res) => {};

// exports.beginnerChallenges = (req, res) => {};

// exports.intermediateChallenges = (req, res) => {};

// exports.advancedChallenges = (req, res) => {};

// exports.usersRanking = (req, res) => {};
