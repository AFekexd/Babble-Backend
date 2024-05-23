import express, { Express } from "express";
import dotenv from "dotenv";
import {
  register,
  login,
  refreshToken,
  logout,
} from "./controllers/AuthController";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import checkSessionMiddleware from "./middlewares/SessionHandler";
import userRoutes from "./routes/userRoutes";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

//for me
// sudo kill -9 $(sudo lsof -t -i:8080)
//npm run dev
const app: Express = express();
const port = 8080;
var corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(
  session({
    genid: (req) => {
      return uuidv4();
    },
    store: new session.MemoryStore(),
    secret: process.env.SECRET || "",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 86_400_000,
      httpOnly: true,
    },
  })
);

app.use(express.json());

//app.use("/users", userRoutes);

app.use(checkSessionMiddleware);

app.get("/", (req, res) => {
  console.log(req.sessionID);
  res.send("Hello World");
});

app.post("/register", register);
app.post("/login", login);
//app.post("/verifyToken", verifyToken);
app.post("/refreshToken", refreshToken);
app.post("/logout", logout);
app.use(userRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
