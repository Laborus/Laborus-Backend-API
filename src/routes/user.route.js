const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticateJWT = require("../middlewares/JWT.middleware");

router.get("/users", userController.getAllUsers);
router.get("/students", userController.getAllStudents);
router.get("/schools", userController.getAllSchools);
router.get("/companies", userController.getAllCompanies);
router.get("/users/:id", userController.getUserById);
router.put("/edit/:id", authenticateJWT, userController.editUser);
router.delete("/user/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.id;

    // Tenta encontrar e deletar o usuário como Student
    let result = await Student.findByIdAndDelete(userId);
    if (result) {
      return successResponse(res, "User deleted successfully.");
    }

    // Se não encontrar, tenta como School
    result = await School.findByIdAndDelete(userId);
    if (result) {
      return successResponse(res, "User deleted successfully.");
    }

    // Se ainda não encontrar, tenta como Company
    result = await Company.findByIdAndDelete(userId);
    if (result) {
      return successResponse(res, "User deleted successfully.");
    }

    // Se não encontrar em nenhum dos três, retorna NOT_FOUND
    return errorResponse(res, "NOT_FOUND");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
});
router.delete("/users", userController.deleteAllUsers);

module.exports = router;
