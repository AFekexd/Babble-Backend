import { NextFunction, Request, Response } from "express";
import pool from "../config/db";
import { SessionType } from "../types/Session";
import { logout } from "../controllers/AuthController";

const checkSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.session.id);
  console.log("Path: " + req.path);

  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/logout"
  ) {
    return next();
  }

  if (req.session.id && (await checkSession(req, res))) {
    console.log("Session is valid");
    return next();
  } else {
    await logout(req, res);
    res.status(401).json({ message: "Unauthorized: Invalid session" });
  }
};

const checkSession = async (req: Request, res: Response) => {
  try {
    const dbSession: SessionType = await findSession(req.sessionID);
    if (!dbSession) {
      console.log("No session found");
      return false;
    }
    console.log("dbsessionIp: " + dbSession.ip);

    if (
      dbSession.expires < Date.now() ||
      dbSession.ip !==
        (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
      //||
      //dbSession.userID !== localSession.user.id
    ) {
      console.log("Session expired");

      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const findSession = async (id: string) => {
  try {
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      id,
    ]);
    return session.rows[0];
  } catch (err) {
    return err;
  }
};

export const deleteSession = async (id: string) => {
  try {
    await pool.query("DELETE FROM sessions WHERE id = $1", [id]).then(() => {
      console.log("Session deleted");
    });
  } catch (err) {
    return err;
  }
};

export const uploadSession = async (req: Request, userID: string) => {
  try {
    await pool.query(
      "INSERT INTO public.sessions (id, userID, ip, expires) VALUES ($1, $2, $3, $4)",
      [
        req.sessionID,
        userID,
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        req.session.cookie.expires,
      ]
    );
  } catch (err) {
    console.log(err);
    return err;
  }
};

export default checkSessionMiddleware;
