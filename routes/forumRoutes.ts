import express from "express";

//make routing for user

const router = express.Router();

router.get("/all");
//add alias to router const and export it

export { router as forumRoutes };
