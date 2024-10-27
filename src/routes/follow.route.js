const express = require("express");
const authenticateJWT = require("../middlewares/JWT.middleware");
const router = express.Router();
const followController = require("../controllers/follow.controller");

router.post("/follow", authenticateJWT, followController.followEntity);

// Rota para listar seguidores
router.get("/followers", authenticateJWT, followController.getFollowers);

router.get("/following", authenticateJWT, followController.getFollowing);

router.delete("/unfollow", authenticateJWT, followController.unfollowEntity);

module.exports = router;
