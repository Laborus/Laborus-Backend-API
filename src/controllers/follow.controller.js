const Student = require("../models/student.model");
const Company = require("../models/company.model");
const School = require("../models/school.model");

exports.followEntity = async (req, res) => {
  try {
    const { entityId } = req.body; // ID da entidade que será seguida (Company ou School)
    const userId = req.user.id; // ID do usuário autenticado (Student)

    // Verifique se a entidade a ser seguida é uma School ou Company
    const isSchool = await School.findById(entityId);
    const isCompany = await Company.findById(entityId);

    if (!isSchool && !isCompany) {
      return res.status(404).json({
        status: "FAILED",
        message: "Entidade não encontrada.",
      });
    }

    // Verifique se o usuário é um estudante
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        status: "FAILED",
        message: "Usuário não encontrado.",
      });
    }

    // Verifique se o estudante já está seguindo a entidade
    if (student.following.includes(entityId)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Você já está seguindo esta entidade.",
      });
    }

    // Adicione a entidade ao array de seguindo do estudante
    student.following.push(entityId);
    await student.save();

    // Adicione o estudante ao array de followers da entidade (Company ou School)
    if (isSchool) {
      isSchool.followers.push(userId); // Assumindo que a entidade tem um array de followers
      await isSchool.save();
    } else if (isCompany) {
      isCompany.followers.push(userId); // Assumindo que a entidade tem um array de followers
      await isCompany.save();
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "Você começou a seguir a entidade com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao seguir entidade:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Erro interno do servidor.",
    });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.id; // ID do usuário autenticado
    const userType = req.user.type; // Tipo de usuário: Student, Company ou School

    let followers = [];
    let followerCount = 0;

    if (userType === "Company") {
      // Se o usuário for uma Company, busque seus seguidores
      const company = await Company.findById(userId).populate(
        "followers",
        "name email profileImage"
      );
      if (!company) {
        return res.status(404).json({
          status: "FAILED",
          message: "Company não encontrada.",
        });
      }
      followers = company.followers;
      followerCount = followers.length;
    } else if (userType === "School") {
      // Se o usuário for uma School, busque seus seguidores
      const school = await School.findById(userId).populate(
        "followers",
        "name email profileImage"
      );
      if (!school) {
        return res.status(404).json({
          status: "FAILED",
          message: "School não encontrada.",
        });
      }
      followers = school.followers;
      followerCount = followers.length;
    } else {
      return res.status(400).json({
        status: "FAILED",
        message: "Apenas Company e School podem ter seguidores.",
      });
    }

    return res.status(200).json({
      status: "SUCCESS",
      followerCount: followerCount,
      followers: followers,
    });
  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Erro interno do servidor.",
    });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.id; // ID do usuário autenticado
    const userType = req.user.accountType; // Altere de req.user.type para req.user.accountType

    // Verifique se o tipo de usuário é válido
    if (!["Student", "Company", "School"].includes(userType)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Tipo de usuário inválido.",
      });
    }

    // Busque as entidades que o usuário está seguindo
    let user;
    if (userType === "Student") {
      user = await Student.findById(userId).populate(
        "following",
        "name email profileImage"
      );
    } else if (userType === "Company") {
      user = await Company.findById(userId).populate(
        "following",
        "name email profileImage"
      );
    } else if (userType === "School") {
      user = await School.findById(userId).populate(
        "following",
        "name email profileImage"
      );
    }

    // Verifique se o usuário foi encontrado
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: `${userType} não encontrado.`,
      });
    }

    // Obtenha as informações de seguindo
    const following = user.following || []; // Use um array vazio se não houver seguindo
    const followingCount = following.length;

    return res.status(200).json({
      status: "SUCCESS",
      followingCount: followingCount,
      following: following,
    });
  } catch (error) {
    console.error("Erro ao buscar seguindo:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Erro interno do servidor.",
    });
  }
};

exports.unfollowEntity = async (req, res) => {
  try {
    const { entityId } = req.body; // ID da entidade que será deixada de seguir (Company ou School)
    const userId = req.user.id; // ID do usuário autenticado (Student)

    // Verifique se a entidade a ser deixada de seguir é uma School ou Company
    const isSchool = await School.findById(entityId);
    const isCompany = await Company.findById(entityId);

    if (!isSchool && !isCompany) {
      return res.status(404).json({
        status: "FAILED",
        message: "Entidade não encontrada.",
      });
    }

    // Verifique se o usuário é um estudante
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        status: "FAILED",
        message: "Usuário não encontrado.",
      });
    }

    // Verifique se o estudante está seguindo a entidade
    if (!student.following.includes(entityId)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Você não está seguindo esta entidade.",
      });
    }

    // Remova a entidade do array de seguindo do estudante
    student.following = student.following.filter(
      (id) => id.toString() !== entityId
    );

    // Remova o estudante do array de followers da entidade
    if (isSchool) {
      isSchool.followers = isSchool.followers.filter(
        (follower) => follower.toString() !== userId
      );
      await isSchool.save();
    } else if (isCompany) {
      isCompany.followers = isCompany.followers.filter(
        (follower) => follower.toString() !== userId
      );
      await isCompany.save();
    }

    // Salve as alterações do estudante
    await student.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "Você deixou de seguir a entidade com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao deixar de seguir entidade:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Erro interno do servidor.",
    });
  }
};
