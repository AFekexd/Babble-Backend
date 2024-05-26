import express from "express";
import {
  createThread,
  deleteThread,
  getForum,
  getThreadById,
  reportThread,
  updateThread,
} from "../controllers/FormController";

//make routing for user

const router = express.Router();

router.get("/", getForum);
router.get("/thread/:id", getThreadById);
router.post("/thread", createThread);
router.put("/thread/:id", updateThread);
router.delete("/thread/:id", deleteThread);
router.post("/thread/report/:id", reportThread);

export { router as forumRoutes };
