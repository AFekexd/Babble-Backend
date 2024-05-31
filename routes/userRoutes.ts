import express from "express";
import {
  deleteUser,
  getPersonalPfp,
  getUserById,
  getUserImage,
  getUsers,
  updateUser,
  uploadUserImage,
} from "../controllers/UserController";

//make routing for user

const router = express.Router();

router.get("/all", getUsers);
router.get("/pfp", getPersonalPfp);
router.get("/:id", getUserById);

router.put("/", updateUser);
router.put("/image", uploadUserImage);
router.get("/pfp/:id", getUserImage);
router.put("/:id", deleteUser);

//add alias to router const and export it

export { router as userRoutes };
