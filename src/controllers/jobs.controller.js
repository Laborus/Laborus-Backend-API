const Job = require("../models/jobs.model");
const JobSubmission = require("../models/jobs.submission.model.js");
const Company = require("../models/company.model");
const Student = require("../models/student.model");
const School = require("../models/school.model"); // Certifique-se de importar o modelo School
const {
  successResponseWithData,
  errorResponse,
  validationErrorWithData,
} = require("../utils/api.response");

// Listar todas as vagas de emprego
exports.getAllJobs = async (req, res) => {
  try {
    // Recupera todas as vagas de emprego e popula as informações da empresa
    const jobs = await Job.find().populate("company", "name");

    // Conta o número total de vagas no sistema
    const totalJobs = await Job.countDocuments();

    return successResponseWithData(
      res,
      "Vagas de emprego recuperadas com sucesso.",
      {
        total: totalJobs, // Adiciona a contagem total de vagas
        jobs: jobs, // Retorna a lista de vagas
      }
    );
  } catch (error) {
    console.error("Erro ao listar vagas de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Editar uma vaga de emprego
exports.updateJob = async (req, res) => {
  const { jobId } = req.params; // Obtém o ID da vaga a partir dos parâmetros da rota
  const updateData = req.body; // Obtém os dados a serem atualizados do corpo da requisição

  try {
    // Encontra a vaga pelo ID e atualiza com os novos dados
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true } // `new: true` retorna o documento atualizado
    ).populate("company", "name as companyName");

    // Verifica se a vaga foi encontrada e atualizada
    if (!updatedJob) {
      return errorResponse(res, "Vaga não encontrada.");
    }

    return successResponseWithData(
      res,
      "Vaga de emprego atualizada com sucesso.",
      updatedJob
    );
  } catch (error) {
    console.error("Erro ao atualizar vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Obter vaga de emprego por ID
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Tente buscar a vaga pelo ID
    const job = await Job.findById(jobId).populate("company", "name");

    if (!job) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    // Povoar candidatos (que pode ser Student, Company ou School)
    if (job.candidates && job.candidates.length > 0) {
      const populatedCandidates = await Promise.all(
        job.candidates.map(async (candidateId) => {
          let candidate;

          // Tente buscar como Student
          candidate = await Student.findById(candidateId).select("name email");
          if (candidate) return candidate;

          // Se não encontrar, tente buscar como Company
          candidate = await Company.findById(candidateId).select("name email");
          if (candidate) return candidate;

          // Se não encontrar, tente buscar como School
          candidate = await School.findById(candidateId).select("name email");
          if (candidate) return candidate;

          // Retorne nulo se não encontrar em nenhum modelo
          return null;
        })
      );

      job.candidates = populatedCandidates.filter(Boolean); // Filtra candidatos nulos
    }

    return successResponseWithData(
      res,
      "Vaga de emprego recuperada com sucesso.",
      job
    );
  } catch (error) {
    console.error("Erro ao obter vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
// Criar uma nova vaga de emprego
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      companyId,
      period,
      modality,
      location,
      tags,
      jobType,
    } = req.body;

    // Verificação básica dos campos obrigatórios
    const missingFields = [];

    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!companyId) missingFields.push("companyId");
    if (!period) missingFields.push("period");
    if (!modality) missingFields.push("modality");
    if (!location) missingFields.push("location");
    if (!jobType) missingFields.push("jobType");

    if (missingFields.length > 0) {
      return validationErrorWithData(
        res,
        `Os seguintes campos obrigatórios estão faltando: ${missingFields.join(
          ", "
        )}.`,
        { missingFields }
      );
    }

    // Verifique se a empresa existe
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, "Empresa inválida ou não encontrada.");
    }

    // Verifica se já existe uma vaga com o mesmo título para a mesma empresa
    const existingJob = await Job.findOne({ title, company: companyId });
    if (existingJob) {
      return errorResponse(
        res,
        "Já existe uma vaga com este título para esta empresa."
      );
    }

    // Verifica se tags é uma string e a transforma em array, ou usa um array vazio
    const formattedTags = Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(",")
      : [];

    const newJob = new Job({
      title,
      description,
      company: companyId,
      period,
      modality,
      location,
      tags: formattedTags,
      jobType, // Adicionando o atributo jobType
    });

    await newJob.save();
    return successResponseWithData(
      res,
      "Vaga de emprego criada com sucesso.",
      newJob
    );
  } catch (error) {
    console.error("Erro ao criar vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Listar todas as vagas de emprego filtradas por jobType
exports.getJobsByType = async (req, res) => {
  const { jobType } = req.query; // Obter jobType dos parâmetros de consulta

  try {
    // Verifica se o jobType é válido
    if (!["ESTAGIO", "APRENDIZ"].includes(jobType)) {
      return errorResponse(res, "jobType deve ser 'ESTAGIO' ou 'APRENDIZ'.");
    }

    // Recupera todas as vagas de emprego com o jobType especificado e popula as informações da empresa
    const jobs = await Job.find({ jobType }).populate(
      "company",
      "name as companyName"
    );

    // Conta o número total de vagas com o jobType especificado
    const totalJobs = await Job.countDocuments({ jobType });

    return successResponseWithData(
      res,
      "Vagas de emprego recuperadas com sucesso.",
      {
        total: totalJobs, // Adiciona a contagem total de vagas
        jobs: jobs, // Retorna a lista de vagas
      }
    );
  } catch (error) {
    console.error("Erro ao listar vagas de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Atualizar uma vaga de emprego
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
    });
    if (!updatedJob) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    return successResponseWithData(
      res,
      "Vaga de emprego atualizada com sucesso.",
      updatedJob
    );
  } catch (error) {
    console.error("Erro ao atualizar vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Deletar uma vaga de emprego
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const deletedJob = await Job.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    return successResponseWithData(
      res,
      "Vaga de emprego deletada com sucesso."
    );
  } catch (error) {
    console.error("Erro ao deletar vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Deletar todas as vagas de emprego
exports.deleteAllJobs = async (req, res) => {
  try {
    await Job.deleteMany({}); // Remove todas as vagas

    return successResponseWithData(
      res,
      "Todas as vagas de emprego foram deletadas com sucesso.",
      {}
    );
  } catch (error) {
    console.error("Erro ao deletar todas as vagas de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Submit a Job
// Submit a Job
exports.submitJob = async (req, res) => {
  try {
    console.log("User from request:", req.user); // Verifique o que está no req.user
    console.log("Decoded JWT User Info:", req.user); // Adicione para debugar

    const { jobId } = req.body; // Job ID from request body
    const userId = req.user.id; // Extract student ID from JWT

    // Verifica se a submissão já existe para o usuário e o trabalho
    const existingSubmission = await JobSubmission.findOne({
      userId: userId,
      jobId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        status: "FAILED",
        error: "BAD_REQUEST",
        message: "You have already submitted for this job.",
      });
    }

    // Cria uma nova submissão de trabalho
    const newSubmission = new JobSubmission({
      userId: userId, // Referência ao estudante
      jobId: jobId,
      status: "pending", // Referência ao trabalho
      file: {
        data: req.file.buffer, // Dados do arquivo CV
        contentType: req.file.mimetype, // Tipo do arquivo CV
      },
      createdAt: Date.now(),
    });

    await newSubmission.save(); // Salva a nova submissão

    // Encontra o trabalho para obter o ID da empresa
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: "FAILED",
        error: "NOT_FOUND",
        message: "Job not found.",
      });
    }

    // Atualiza o trabalho com o novo ID da submissão no array de candidatos
    await Job.findByIdAndUpdate(
      jobId,
      { $push: { candidates: newSubmission._id } }, // Adiciona o novo ID da submissão ao array de candidatos do trabalho
      { new: true }
    );

    // Atualiza a empresa com o novo ID do trabalho no array de jobPostings
    const updatedCompany = await Company.findByIdAndUpdate(
      job.company, // Obtém o ID da empresa a partir do documento do trabalho
      { $addToSet: { jobPostings: jobId } }, // Adiciona o novo ID do trabalho ao array jobPostings da empresa sem duplicatas
      { new: true } // Retorna o documento atualizado
    );

    return successResponseWithData(res, "Job submitted successfully.", {
      submission: newSubmission,
      company: updatedCompany, // Inclui a empresa atualizada na resposta
    });
  } catch (error) {
    console.error("Error submitting job:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Listar candidatos que se candidataram para a vaga
exports.getJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate("candidates", "name email"); // Popula os dados dos candidatos
    if (!job) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    return successResponseWithData(
      res,
      "Candidatos recuperados com sucesso.",
      job.candidates // Retorna os candidatos da vaga
    );
  } catch (error) {
    console.error("Erro ao listar candidatos:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Cancelar uma Submissão de Trabalho
exports.cancelJobSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params; // Obtenha o ID da submissão da rota
    const userId = req.user.id; // Extraia o ID do usuário do JWT

    // Encontra a submissão pelo ID e verifica se pertence ao usuário
    const submission = await JobSubmission.findOne({
      _id: submissionId,
      userId: userId,
    });

    if (!submission) {
      return res.status(404).json({
        status: "FAILED",
        error: "NOT_FOUND",
        message:
          "Submission not found or you do not have permission to cancel it.",
      });
    }

    // Remove a submissão do banco de dados
    await JobSubmission.findByIdAndDelete(submissionId);

    // Atualiza o trabalho para remover o ID da submissão do array de candidatos
    await Job.findByIdAndUpdate(
      submission.jobId,
      { $pull: { candidates: submissionId } }, // Remove o ID da submissão do array de candidatos
      { new: true }
    );

    return res.status(200).json({
      status: "SUCCESS",
      message: "Job submission canceled successfully.",
    });
  } catch (error) {
    console.error("Error canceling job submission:", error);
    return res.status(500).json({
      status: "FAILED",
      error: "INTERNAL_SERVER_ERROR",
      message: "An error occurred while canceling the job submission.",
    });
  }
};

// // Listar estudantes que aplicaram para a vaga
// exports.submittedStudents = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const job = await Job.findById(jobId).populate(
//       "applications.studentId",
//       "name email"
//     );
//     if (!job) {
//       return errorResponse(res, "Vaga de emprego não encontrada.");
//     }

//     return successResponseWithData(
//       res,
//       "Estudantes que aplicaram recuperados com sucesso.",
//       job.applications
//     );
//   } catch (error) {
//     console.error("Erro ao listar estudantes que aplicaram:", error);
//     return errorResponse(res, "INTERNAL_SERVER_ERROR");
//   }
// };

// Reportar uma vaga de emprego
exports.reportJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    job.reports.push({ studentId: req.student.id, reason });
    await job.save();

    return successResponseWithData(
      res,
      "Vaga de emprego reportada com sucesso."
    );
  } catch (error) {
    console.error("Erro ao reportar vaga de emprego:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
