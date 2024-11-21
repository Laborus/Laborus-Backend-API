// comment.controller.js
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const Student = require("../models/student.model");
const School = require("../models/school.model");

exports.createComment = async (req, res) => {
  const { textContent } = req.body;
  const userId = req.user.id;
  const postId = req.params.postId;

  if (!textContent) {
    return res
      .status(400)
      .json({ message: "Conteúdo do comentário é obrigatório." });
  }

  try {
    // Verifica se o post existe
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ message: "Post não encontrado." });
    }

    // Inicializa `postedBy` e `postedByModel`
    let postedBy;
    let postedByModel;

    // Verifica se o usuário é uma escola
    const school = await School.findById(userId);
    if (school) {
      postedBy = {
        id: school._id,
        name: school.name || "Nome não especificado",
        photo: school.profileImage || "../public/images/bannerImage_default.png",
        school: school.name || "Escola não especificada",
      };
      postedByModel = "School";
    } else {
      // Verifica se o usuário é um estudante
      const student = await Student.findById(userId).populate("school");
      if (student) {
        postedBy = {
          id: student._id,
          name: student.name || "Nome não especificado",
          photo: student.profileImage || "../public/images/bannerImage_default.png",
          school: student.school?.name || "Escola não especificada",
        };
        postedByModel = "Student";
      } else {
        return res.status(403).json({ message: "Usuário não autorizado." });
      }
    }

    // Valida se os campos obrigatórios estão presentes
    if (!postedBy.name || !postedBy.school) {
      console.error("Erro ao construir 'postedBy':", postedBy);
      return res
        .status(400)
        .json({ message: "Campos obrigatórios do autor estão ausentes." });
    }

    // Cria o novo comentário
    const newComment = new Comment({
      textContent,
      postedBy,
      postedByModel,
      postId,
      likes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Novo Comentário Criado:", newComment);

    // Salva o comentário no banco de dados
    await newComment.save();

    return res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao criar o comentário.", error });
  }
};


// Edição do Comentário
exports.editComment = async (req, res) => {
  const { commentId } = req.params;
  const { textContent } = req.body;

  if (!textContent) {
    return res
      .status(400)
      .json({ message: "Conteúdo do comentário é obrigatório." });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    // Verifica se o usuário é o autor do comentário
    if (!comment.postedBy.equals(req.user.id)) {
      return res
        .status(403)
        .json({
          message: "Você não tem permissão para editar este comentário.",
        });
    }

    comment.textContent = textContent;
    comment.updatedAt = Date.now();
    await comment.save();

    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao editar comentário.", error });
  }
};

// Deleção do Comentário
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    // Verifica se o usuário é o autor do comentário
    if (!comment.postedBy.equals(req.user.id)) {
      return res
        .status(403)
        .json({
          message: "Você não tem permissão para deletar este comentário.",
        });
    }

    await Comment.findByIdAndDelete(commentId);
    return res
      .status(200)
      .json({ message: "Comentário deletado com sucesso." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao deletar comentário.", error });
  }
};

exports.likeComment = async (req, res) => {
  console.log("ID do comentário recebido:", req.params.commentId);
  console.log("Usuário autenticado:", req.user);

  const { commentId } = req.params;

  if (!commentId) {
    return res.status(400).json({ message: "ID do comentário ausente." });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    const userId = req.user.id;

    if (comment.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Você já curtiu este comentário." });
    }

    comment.likes.push(userId);
    await comment.save();

    res
      .status(200)
      .json({ message: "Comentário curtido com sucesso.", comment });
  } catch (error) {
    console.error("Erro ao curtir comentário:", error);
    res.status(500).json({ message: "Erro ao curtir o comentário.", error });
  }
};