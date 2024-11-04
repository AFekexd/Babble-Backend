import express from "express";
import {
  createThread,
  deleteThread,
  filterForum,
  getForum,
  getThreadById,
  reportThread,
  updateThread,
} from "../controllers/FormController";
import {
  createComment,
  deleteComment,
  getThreadComments,
  updateComment,
  voteComment,
} from "../controllers/CommentController";

//make routing for user

const router = express.Router();

router.get("/", getForum);

router.get("/search", filterForum);
router.get("/thread/:id", getThreadById);
router.post("/thread", createThread);
router.put("/thread/:id", updateThread);
router.delete("/thread/:id", deleteThread);
router.post("/thread/report/:id", reportThread);

router.get("/thread/:id/comment", getThreadComments);
router.post("/thread/comment", createComment);
router.put("/thread/:id/comment/:commentId", updateComment);
router.delete("/thread/:id/comment/:commentId", deleteComment);
router.put("/thread/comment/:type/:commentId/:userId", voteComment);

export { router as forumRoutes };
