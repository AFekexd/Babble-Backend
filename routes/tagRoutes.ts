import express from "express";
import {
  createTag,
  deleteTag,
  getTagById,
  searchTags,
} from "../controllers/TagController";

//make routing for user

const router = express.Router();

router.post("/", createTag);
router.delete("/:id", deleteTag);
router.get("/:id", getTagById);
router.get("/search/:name", searchTags);
router.get("/paginate/:page", searchTags);

export { router as tagRoutes };
