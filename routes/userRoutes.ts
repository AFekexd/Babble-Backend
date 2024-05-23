import { Express } from "express";
import { getUserById, getUsers } from "../controllers/UserController";

const userRoutes = (app: Express) => {
  app.get("/users", getUsers);
  app.get("/user/:id", getUserById);
  //app.put("/users", updateUser);
  //app.delete("/users", deleteUser);
};

export default userRoutes;
