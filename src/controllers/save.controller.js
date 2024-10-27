// const Student = require("../models/student.model");
// const School = require("../models/school.model");
// const Company = require("../models/company.model");
// const Post = require("../models/post.model");
// const Job = require("../models/jobs.model");

// exports.saveItem = async (req, res) => {
//   try {
//     const userId = req.user.id; // ID do usuário autenticado
//     const { itemId, itemType } = req.body; // itemId: ID do Post ou Job, itemType: "Post" ou "Job"

//     if (!["Post", "Job"].includes(itemType)) {
//       return res.status(400).json({
//         status: "FAILED",
//         message: "Tipo de item inválido. Use 'Post' ou 'Job'.",
//       });
//     }

//     let item;
//     if (itemType === "Post") {
//       item = await Post.findById(itemId);
//     } else if (itemType === "Job") {
//       item = await Job.findById(itemId);
//     }

//     if (!item) {
//       return res.status(404).json({
//         status: "FAILED",
//         message: `${itemType} não encontrado.`,
//       });
//     }

//     let user;
//     if (req.user.type === "Student") {
//       user = await Student.findById(userId);
//     } else if (req.user.type === "School") {
//       user = await School.findById(userId);
//     } else if (req.user.type === "Company") {
//       user = await Company.findById(userId);
//     } else {
//       return res.status(400).json({
//         status: "FAILED",
//         message: "Tipo de usuário inválido.",
//       });
//     }

//     if (!user) {
//       return res.status(404).json({
//         status: "FAILED",
//         message: "Usuário não encontrado.",
//       });
//     }

//     if (!user.saved.includes(itemId)) {
//       user.saved.push(itemId);
//       user.savedItemType = itemType; // Armazena o tipo do item salvo
//       await user.save();
//     }

//     return res.status(200).json({
//       status: "SUCCESS",
//       message: `${itemType} salvo com sucesso.`,
//     });
//   } catch (error) {
//     console.error("Erro ao salvar item:", error);
//     return res.status(500).json({
//       status: "FAILED",
//       message: "Erro interno do servidor.",
//     });
//   }
// };
