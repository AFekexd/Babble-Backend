import { NextFunction, Request, Response } from "express";
import { Session } from "express-session";
import pool from "../config/db";
import { SessionType } from "../types/Session";
import { SessionData } from "express-session";

type CustomSession = Session &
  Partial<SessionData> & {
    user?: any;
  };

const checkSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("req.sessionID: " + req.sessionID);
  console.log("Path: " + req.path);
  console.log("Suser: " + (req.session as CustomSession).user);
  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/api/auth/refresh" ||
    req.path === "/logout"
  ) {
    return next();
  }

  if (req.session.id) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized: Invalid session" });
  }
};

const checkSession = async (req: Request, res: Response) => {
  const localSession = req.session;
  try {
    const dbSession: SessionType = await findSession(req.sessionID);
    console.log("dbSession: " + dbSession);
    if (!dbSession) {
      console.log("No session found");
      return false;
    }
    if (
      dbSession.expires < Date.now() ||
      dbSession.addr !== req.ip
      //||
      //dbSession.userID !== localSession.user.id
    ) {
      console.log("Session expired");
      deleteSession(req.sessionID);
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
    await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
  } catch (err) {
    return err;
  }
};

export const uploadSession = async (req: Request, userID: string) => {
  try {
    console.log("-----------------");
    console.log("uploadSession");
    console.log("req.sessionID: " + req.sessionID);
    console.log("userID: " + userID);
    console.log("-----------------");
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
