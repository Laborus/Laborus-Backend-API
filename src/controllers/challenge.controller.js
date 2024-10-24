const Challenge = require("../models/challenge.model");
const Submission = require("../models/challenge.response"); // Import the Submission model.
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

// Submit a Challenge
// Submit a Challenge
exports.submitChallenge = async (req, res) => {
  try {
    console.log("User from request:", req.user);

    const { challengeId } = req.body; // Challenge ID from request body
    const studentId = req.user.id; // Extract user ID from JWT

    // Check if a submission already exists for the user and the challenge
    const existingSubmission = await Submission.findOne({
      userId: studentId,
      challengeId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        status: "FAILED",
        error: "BAD_REQUEST",
        message: "You have already submitted this challenge.",
      });
    }

    // Find the challenge to get the schoolId
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        status: "FAILED",
        error: "NOT_FOUND",
        message: "Challenge not found.",
      });
    }

    // Create a new submission
    const newSubmission = new Submission({
      userId: studentId, // Reference to the student
      challengeId, // Reference to the challenge
      schoolId: challenge.school, // Save the school ID from the challenge
      file: {
        data: req.file.buffer, // File data
        contentType: req.file.mimetype, // File type
      },
      status: "pending", // Default status for new submissions
    });

    await newSubmission.save(); // Save the new submission

    // Update the school with the new submission
    await School.findByIdAndUpdate(
      challenge.school, // Assuming the Challenge model has a 'school' field
      { $push: { submissions: newSubmission._id } }, // Add new submission ID to school's submissions array
      { new: true } // Return the updated document
    );

    return successResponseWithData(
      res,
      "Challenge submitted successfully.",
      newSubmission
    );
  } catch (error) {
    console.error(error); // Log the error for debugging
    return errorResponse(res, "INTERNAL_SERVER_ERROR"); // Respond with internal server error
  }
};

exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { submissionId } = req.params; // Get submission ID from route parameters
    const { status } = req.body; // Get the new status from the request body

    // Validate the status value
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "FAILED",
        error: "BAD_REQUEST",
        message: "Status must be 'approved' or 'rejected'.",
      });
    }

    // Find the submission and update its status
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { status }, // Update status
      { new: true } // Return the updated document
    );

    if (!updatedSubmission) {
      return res.status(404).json({
        status: "FAILED",
        error: "NOT_FOUND",
        message: "Submission not found.",
      });
    }

    return successResponseWithData(
      res,
      "Submission status updated successfully.",
      updatedSubmission
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

exports.cancelSubmission = async (req, res) => {
  try {
    const { challengeId } = req.body; // Challenge ID from request body
    const studentId = req.user.id; // Extract user ID from JWT

    // Find the submission to cancel
    const submission = await Submission.findOneAndDelete({
      userId: studentId,
      challengeId,
    });
    if (!submission) {
      return res.status(404).json({
        status: "FAILED",
        error: "NOT_FOUND",
        message: "Submission not found.",
      });
    }

    // Update the school to remove the submission reference
    const challenge = await Challenge.findById(challengeId);
    await School.findByIdAndUpdate(
      challenge.school,
      { $pull: { submissions: submission._id } },
      { new: true }
    );

    return successResponseWithData(
      res,
      "Submission canceled successfully.",
      submission
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get All Submissions
// exports.getAllSubmissions = async (req, res) => {
//   try {
//     // Fetch all submissions
//     const submissions = await Submission.find({})
//       .populate("student") // Populate student details
//       .populate("challenge"); // Populate challenge details

//     return successResponseWithData(
//       res,
//       "Todas as submissões recuperadas com sucesso.",
//       submissions
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, "Erro ao recuperar as submissões.");
//   }
// };

// exports.challengeSolved = (req, res) => {};

// exports.solvedList = (req, res) => {};

// exports.pointsChallenges = (req, res) => {};

// exports.progressChallenges = (req, res) => {};

// exports.beginnerChallenges = (req, res) => {};

// exports.intermediateChallenges = (req, res) => {};

// exports.advancedChallenges = (req, res) => {};

// exports.usersRanking = (req, res) => {};
