import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/UserController";

//make routing for user

const router = express.Router();

router.get("/all", getUsers);
router.get("/:id", getUserById);
router.put("/", updateUser);
router.delete("/:id", deleteUser);

//add alias to router const and export it

export { router as userRoutes };
