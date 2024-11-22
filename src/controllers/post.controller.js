const Post = require("../models/post.model");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Comment = require("../models/comment.model");

exports.createPostForCampus = async (req, res) => {
  const { title, textContent, image, video } = req.body;
  const userId = req.user.id;
  const campusId = req.params.campusId;

  try {
    // Primeiro, tenta encontrar a escola
    const school = await School.findById(userId);
    if (school) {
      const newPost = new Post({
        title,
        textContent,
        postedOn: "Campus",
        image,
        video,
        postedBy: {
          id: userId,
          name: school.name, // Supondo que o campo `name` exista na escola
          photo: school.profileImage, // Supondo que o campo `profileImage` exista na escola
          school: school._id, // ID da escola
        },
        postedByModel: "School",
        campusId,
      });
      const savedPost = await newPost.save();
      return res.status(201).json(savedPost);
    }

    // Caso contrário, tenta encontrar o estudante
    const student = await Student.findById(userId);
    
    if (student && student.school.toString() === campusId) {

      const school = await School.findById(student.school);
      
      const newPost = new Post({
        title,
        textContent,
        postedOn: "Campus",
        image,
        video,
        postedBy: {
          id: userId,
          name: student.name, // Nome do estudante
          photo: student.profileImage, // Foto do estudante
          school: school.name, // ID da escola do estudante
        },
        postedByModel: "Student",
        campusId,
      });
      const savedPost = await newPost.save();
      return res.status(201).json(savedPost);
    }

    return res
      .status(403)
      .json({ message: "Você não tem permissão para postar neste campus." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar o post.", error });
  }
};


exports.createPost = async (req, res) => {
  const { title, textContent, image, video } = req.body;
  const { id, userType } = req.user; // Lido do middleware JWT
  console.log(id, userType);

  if (!title || !textContent) {
    return res
      .status(400)
      .json({ message: "Título e conteúdo são obrigatórios." });
  }

  try {
    
    
    const student = await Student.findById(id);
    const school = await School.findById(student.school);
    console.log(school)
    let postedBy = {};

    // Caso o usuário seja uma escola
    if (userType === "School") {
      
      console.log(school);
      if (!school) {
        return res.status(404).json({ message: "Escola não encontrada." });
      }
      postedBy = {
        id: school._id,        // ID da escola
        name: school.name,     // Nome da escola
        photo: school.profileImage, // Foto de perfil da escola
        school: school._id,    // ID da escola
      };
    }
  
    // Caso o usuário seja um estudante
    if (userType === "Student") {
     
      if (!student) {
        return res.status(404).json({ message: "Estudante não encontrado." });
      }

      postedBy = {
        id: student._id,       // ID do estudante
        name: student.name,    // Nome do estudante
        photo: student.profileImage, // Foto de perfil do estudante
        school: school.name,   // ID da escola do estudante
      };
    }

    const newPost = new Post({
      title,
      textContent,
      postedOn: "Global",
      image,
      video,
      postedBy,
      postedByModel: userType === "school" ? "School" : "Student", // Definido dinamicamente
    });

    const savedPost = await newPost.save();
    return res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar o post.", error });
  }
};

// Busca todos os posts globais e seus comentários
exports.getGlobalPosts = async (req, res) => {
  try {
    const globalPosts = await Post.find({ postedOn: "Global" })
      .populate("postedBy") // Popula os dados do autor do post
      .exec();

    // Busca e adiciona os comentários de cada post
    const postsWithComments = await Promise.all(
      globalPosts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id }).exec();
        return { ...post.toObject(), comments }; // Adiciona os comentários ao post
      })
    );

    return res.status(200).json(postsWithComments);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar posts globais", error });
  }
};

// Busca todos os posts de um campus específico e seus comentários
exports.getCampusPosts = async (req, res) => {
  const { campusId } = req.params;
  const user = req.user; // Usuário autenticado extraído do middleware

  try {
    // Valida se o usuário autenticado pertence ao campus
    if (user.userType === "School") {
      // Se for uma escola, verifica se o `campusId` da escola corresponde
      if (user.id !== campusId) {
        return res
          .status(403)
          .json({ message: "Acesso negado. Você não pertence a este campus." });
      }
    } else if (user.userType === "Student") {
      // Se for um estudante, verifica se ele pertence a uma escola no campus
      const student = await Student.findById(user.id).populate("school");
      if (!student || String(student.school?._id) !== String(campusId)) {
        return res
          .status(403)
          .json({ message: "Acesso negado. Você não pertence a este campus." });
      }
    } else {
      // Usuário não identificado corretamente
      return res.status(403).json({ message: "Usuário não autorizado." });
    }

    // Busca os posts do campus
    const campusPosts = await Post.find({ campusId })
      .populate("postedBy") // Popula os dados do autor do post
      .exec();

    if (campusPosts.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum post encontrado para este campus." });
    }

    // Busca e adiciona os comentários de cada post
    const postsWithComments = await Promise.all(
      campusPosts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id }).exec();
        return { ...post.toObject(), comments }; // Adiciona os comentários ao post
      })
    );

    return res.status(200).json(postsWithComments);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar posts do campus", error });
  }
};


// Busca todos os posts de um usuário específico pelo ID do usuário
exports.postsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // ID do usuário recebido como parâmetro

    // Busca os posts criados pelo usuário
    const userPosts = await Post.find({ postedBy: userId })
      .populate("postedBy") // Popula os dados do autor do post
      .exec();

    if (userPosts.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum post encontrado para este usuário." });
    }

    // Busca e adiciona os comentários de cada post
    const postsWithComments = await Promise.all(
      userPosts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id }).exec();
        return { ...post.toObject(), comments }; // Adiciona os comentários ao post
      })
    );

    return res.status(200).json(postsWithComments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar posts do usuário", error });
  }
};


// Busca um post pelo ID
exports.postById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).exec(); // Busque o post

    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Busque os comentários associados ao post
    const comments = await Comment.find({ postId: post._id }).exec();

    // Adicione os comentários ao post
    post.comments = comments;

    return res.status(200).json(post); // Retorne o post com os comentários
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar post", error });
  }
};

// Atualiza um post pelo ID
exports.updatePost = async (req, res) => {
  const { postedOn } = req.body;

  // Verifica se a atualização envolve o campo "Campus" e se o usuário tem uma instituição associada
  if (postedOn === "Campus" && !req.user.school) {
    return res.status(403).json({
      message:
        "Usuário precisa estar cadastrado em uma instituição para postar no Campus.",
    });
  }

  try {
    // Encontra o post pelo ID
    const post = await Post.findById(req.params.id);

    // Verifica se o post existe
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Verifica se o usuário que está tentando atualizar é o criador do post
    if (post.postedBy.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Você não tem permissão para atualizar este post.",
      });
    }

    // Atualiza o post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar post", error });
  }
};


// Deleta um post pelo ID
exports.deletePost = async (req, res) => {
  try {
    // Encontrar o post pelo ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Verifica se o usuário que tenta deletar o post é o autor do post
    if (!post.postedBy.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para deletar este post" });
    }

    // Deletar o post
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deletado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar post", error });
  }
};

exports.like = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post não encontrado" });

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Você já curtiu este post." });
    }

    post.likes.push(req.user.id);
    await post.save();
    return res.status(200).json({ message: "Post curtido com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao curtir post", error });
  }
};

exports.dislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post não encontrado" });

    if (post.dislikes.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "Você já deu dislike neste post." });
    }

    post.dislikes.push(req.user.id);
    await post.save();
    return res.status(200).json({ message: "Dislike registrado com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao dar dislike", error });
  }
};

// Compartilha um post
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Incrementa o contador de shares
    post.shares += 1;

    // Adiciona o usuário que compartilhou
    if (!post.sharedBy.includes(req.user.id)) {
      post.sharedBy.push(req.user.id);
    }

    // Salva o post atualizado
    await post.save();

    // Gerar o link do post compartilhado
    const shareLink = `${req.protocol}://${req.get("host")}/api/posts/${
      post._id
    }`;

    return res.status(200).json({
      message: "Post compartilhado com sucesso",
      shareLink: shareLink, // Retorna o link gerado
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao compartilhar post", error });
  }
};

// Reporta um post
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    if (post.reports.includes(req.user.id)) {
      return res.status(400).json({ message: "Você já reportou este post" });
    }

    // Adiciona o ID do usuário aos reports
    post.reports.push(req.user.id);

    // Verifica se o post deve ser bloqueado
    const likeCount = post.likes.length;
    const reportCount = post.reports.length;

    // Calcula a proporção de reports em relação às curtidas
    if (reportCount >= 20 && reportCount / likeCount >= 0.3) {
      post.isBlocked = true; // Bloqueia o post
    }

    await post.save();
    return res
      .status(200)
      .json({ message: "Post reportado com sucesso", post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao reportar post", error });
  }
};
