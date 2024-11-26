const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/JWT.middleware");
const discussionController = require("../controllers/discussion.controller");

// Rotas para discussões
router.post("/:campusId/discussion", authenticateJWT, discussionController.createDiscussion);
router.get("/:campusId/discussions", authenticateJWT, discussionController.listDiscussions);
router.get("/:campusId/discussion/:discussionId", authenticateJWT, discussionController.getDiscussionById); 
router.post("/:campusId/discussion/:discussionId/comment", authenticateJWT, discussionController.addDiscussionComment);
router.get("/:campusId/discussion/:discussionId/comments", authenticateJWT, discussionController.listDiscussionComments);
router.patch("/:campusId/discussion/:discussionId/close", authenticateJWT, discussionController.closeDiscussion);

module.exports = router;
