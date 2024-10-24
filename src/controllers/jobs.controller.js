const Job = require("../models/job");
const Company = require("../models/company");
const Student = require("../models/student");
const {
  successResponseWithData,
  errorResponse,
  validationErrorWithData,
} = require("../utils/api.response");

// Criar uma nova vaga de emprego
exports.createJob = async (req, res) => {
  try {
    const { title, description, companyId, period, modality, location, tags } =
      req.body;

    // Verificação básica dos campos obrigatórios
    if (
      !title ||
      !description ||
      !companyId ||
      !period ||
      !modality ||
      !location
    ) {
      return validationErrorWithData(
        res,
        "Todos os campos obrigatórios devem ser preenchidos.",
        {}
      );
    }

    // Verifique se a empresa existe
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, "Empresa inválida ou não encontrada.");
    }

    const newJob = new Job({
      title,
      description,
      company: companyId,
      period,
      modality,
      location,
      tags: tags ? tags.split(",") : [],
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

// Enviar aplicação para a vaga de emprego
exports.submitJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const studentId = req.student.id; // Alterado para referenciar o estudante

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    // Verifique se o estudante já aplicou para esta vaga
    const existingApplication = await job.applications.find((application) =>
      application.studentId.equals(studentId)
    );
    if (existingApplication) {
      return errorResponse(res, "Você já aplicou para esta vaga.");
    }

    // Adicione a aplicação do estudante
    job.applications.push({ studentId });
    await job.save();

    return successResponseWithData(res, "Aplicação enviada com sucesso.", job);
  } catch (error) {
    console.error("Erro ao enviar aplicação:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Listar estudantes que aplicaram para a vaga
exports.submittedStudents = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate(
      "applications.studentId",
      "name email"
    );
    if (!job) {
      return errorResponse(res, "Vaga de emprego não encontrada.");
    }

    return successResponseWithData(
      res,
      "Estudantes que aplicaram recuperados com sucesso.",
      job.applications
    );
  } catch (error) {
    console.error("Erro ao listar estudantes que aplicaram:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

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
