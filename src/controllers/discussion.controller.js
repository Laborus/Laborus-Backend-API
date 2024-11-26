// Criar uma nova discussão
const Discussion = require("../models/discussion.model");
const DiscussionComment = require("../models/discussionComment.model");
const Student = require("../models/student.model");
const School = require("../models/school.model"); // Modelo School
const mongoose = require("mongoose");

// Criar uma nova discussão
 const createDiscussion = async (req, res) => {
    try {
        const { campusId } = req.params; // ID do campus (school) na URL
        const { title, description } = req.body;
        const studentId = req.user.id; // ID do aluno autenticado

        // Verificar se o aluno pertence ao campus
        const student = await Student.findById(studentId);
        if (!student || student.school.toString() !== campusId) {
        return res.status(403).json({ success: false, message: "Você não pertence a este campus." });
        }

        // Obter a escola associada ao aluno
        const school = await School.findById(student.school);

        // Criar a discussão
        const newDiscussion = await Discussion.create({
        title,
        description,
        postedBy: {
            id: studentId,
            name: student.name, // Nome do estudante
            photo: student.profileImage, // Foto do estudante
            school: school.name, // Nome da escola
        },
        postedByModel: "Student", // Indica que foi um estudante que criou
        campusId,
        });

        res.status(201).json({ success: true, discussion: newDiscussion });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao criar a discussão.", error });
    }
};

const getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params; // Corrigido para usar o parâmetro correto da URL

    // Busca a discussão e popula os campos necessários
    const discussion = await Discussion.findById(discussionId)
      .populate("postedBy.id", "name profileImage school") // Popula o autor
      .populate("campusId", "name") // Popula o campus (escola)
      .populate({
        path: "comments",
        populate: {
          path: "postedBy.id", // Popula o autor de cada comentário
          select: "name profileImage",
        },
      })
      .populate("selectedAnswer") // Popula a resposta selecionada, se existir
      .lean(); // Retorna um objeto JSON simples em vez de um documento Mongoose

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussão não encontrada.",
      });
    }

    // Retorna a discussão encontrada
    res.status(200).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar a discussão.",
      error: error.message,
    });
  }
};

const listDiscussions = async (req, res) => {
    try {
      const { campusId } = req.params; // ID do campus na URL
      const studentId = req.user.id; // ID do aluno autenticado
  
      // Verificar se o aluno pertence ao campus
      const student = await Student.findById(studentId);
      if (!student || student.school.toString() !== campusId) {
        return res.status(403).json({ success: false, message: "Você não pertence a este campus." });
      }
  
      // Buscar discussões relacionadas ao campus
      const discussions = await Discussion.find({ campusId })
        .populate("comments")
        .populate("selectedAnswer");
  
      // Adicionar detalhes ao `postedBy` para cada discussão
      const discussionsWithPostedBy = await Promise.all(
        discussions.map(async (discussion) => {
          const postedByDetails = await discussion.populatePostedByDetails();
          return {
            ...discussion.toObject(),
            postedBy: postedByDetails,
          };
        })
      );
  
      res.status(200).json({ success: true, discussions: discussionsWithPostedBy });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erro ao listar discussões.", error });
    }
  };
  
  const addDiscussionComment = async (req, res) => {
    try {
      const { campusId, discussionId } = req.params; // ID do campus e da discussão na URL
      const { textContent } = req.body; // Conteúdo do comentário
      const studentId = req.user.id; // ID do aluno autenticado
      console.log(campusId, discussionId);
      
      // Verificar se o aluno pertence ao campus
      const student = await Student.findById(studentId);
      if (!student || student.school.toString() !== campusId) {
        return res.status(403).json({
          success: false,
          message: "Você não pertence a este campus.",
        });
      }
    
      // Verificar se a discussão pertence ao campus
      const discussion = await Discussion.findById(discussionId);
      if (!discussion || discussion.campusId.toString() !== campusId) {
        return res.status(404).json({
          success: false,
          message: "Discussão não encontrada neste campus.",
        });
      }
    
      // Obter detalhes da escola do aluno
      const school = await School.findById(student.school);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: "Escola não encontrada.",
        });
      }
    
      // Criar o comentário
      const commentData = {
        textContent, // Conteúdo do comentário
        postedBy: {
          id: student._id, // ID do aluno
          name: student.name, // Nome do aluno
          photo: student.profileImage, // Foto do aluno
          school: school.name, // Nome da escola
        },
        postedByModel: "Student", // Tipo de modelo (Aluno)
        discussionId, // ID da discussão
      };
  
      // Criar o comentário e salvar
      const comment = new DiscussionComment(commentData);
      await comment.save(); // Salva o comentário no banco de dados
    
      // Adicionar o comentário à discussão (não apenas o ID)
      discussion.comments.push(comment); // Adiciona o comentário completo, não só o ID
      await discussion.save(); // Salva a discussão com o novo comentário
      
      res.status(201).json({ success: true, comment });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao adicionar comentário.",
        error: error.message,
      });
    }
  };
  
  const listDiscussionComments = async (req, res) => {
    try {
      const { campusId, discussionId } = req.params; // ID do campus e da discussão na URL
      const studentId = req.user.id; // ID do aluno autenticado
  
      // Verificar se o aluno pertence ao campus
      const student = await Student.findById(studentId);
      if (!student || student.school.toString() !== campusId) {
        return res.status(403).json({ success: false, message: "Você não pertence a este campus." });
      }
  
      // Verificar se a discussão pertence ao campus
      const discussion = await Discussion.findById(discussionId);
      if (!discussion || discussion.campusId.toString() !== campusId) {
        return res.status(404).json({ success: false, message: "Discussão não encontrada neste campus." });
      }
  
      // Listar os comentários da discussão com os dados do autor
      const comments = await DiscussionComment.find({ discussionId })
        .populate("postedBy", "name photo school")  // Popula o autor do comentário com nome, foto e escola
        .populate("likes", "name")  // Popula os usuários que curtiram o comentário
        .populate("dislikes", "name");  // Popula os usuários que não curtiram o comentário
  
      res.status(200).json({ success: true, comments });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erro ao listar comentários.", error });
    }
  };
  
  
// Encerrar uma discussão
const closeDiscussion = async (req, res) => {
  try {
    const { campusId, discussionId } = req.params; // ID do campus e da discussão na URL
    const { commentId } = req.body; // ID do comentário selecionado
    const studentId = req.user.id; // ID do aluno autenticado

    // Verificar se o aluno pertence ao campus
    const student = await Student.findById(studentId);
    if (!student || student.school.toString() !== campusId) {
      return res.status(403).json({ success: false, message: "Você não pertence a este campus." });
    }

    // Verificar se a discussão pertence ao campus e se foi criada pelo aluno
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.campusId.toString() !== campusId) {
      return res.status(403).json({ success: false, message: "Discussão não encontrada neste campus." });
    }

    // Verificar se o aluno autenticado é o criador da discussão
    if (discussion.postedBy.id.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: "Você não tem permissão para encerrar esta discussão." });
    }

    // Verificar se o comentário pertence à discussão
    const comment = await DiscussionComment.findById(commentId);
    if (!comment || comment.discussionId.toString() !== discussionId) {
      return res.status(404).json({ success: false, message: "Comentário inválido." });
    }

    // Marcar o comentário como a resposta selecionada e fechar a discussão
    discussion.selectedAnswer = commentId;
    discussion.isClosed = true;
    discussion.commentsEnabled = false;
    await discussion.save();

    res.status(200).json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao encerrar a discussão.", error });
  }
};


// Exportar os controladores
module.exports = {
  createDiscussion,
  listDiscussions,
  addDiscussionComment,
  listDiscussionComments,
  closeDiscussion,
  getDiscussionById
};
