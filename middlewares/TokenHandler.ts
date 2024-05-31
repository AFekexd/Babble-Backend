//@ts-nocheck
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User";

const checkTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/logout"
  ) {
    return next();
  }

  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");
  try {
    await verifyToken(req, res);
    await refreshToken(req, res);
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

const verifyToken = async (req: Request, res: Response) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET || "");
    if (req.sessionID !== verified.sid)
      return res.status(400).send("Invalid Token");
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

const refreshToken = async (req: Request, res: Response) => {
  const token = req.header("Authorization");
  const refreshToken = req.body.refresh_token;
  if (!token) return res.status(401).send("Access Denied");
  if (!refreshToken) return res.status(400).send("Bad Request");

  try {
    const verified = jwt.verify(
      token.split(" ")[1],
      process.env.TOKEN_SECRET || ""
    );
    const verifiedRefresh = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET || ""
    );

    if (verifiedRefresh.exp < Math.floor(Date.now() / 1000))
      return res.status(400).send("Expired RToken");
    if (verifiedRefresh.typ !== "Refresh")
      return res.status(400).send("Invalid RToken type");
    if (verified.iss !== verifiedRefresh.iss)
      return res.status(400).send("Invalid Issuer");
    if (verified.sub !== verifiedRefresh.sub)
      return res.status(400).send("Invalid Subject");
    if (
      verified.sid !== verifiedRefresh.sid ||
      verifiedRefresh.sid !== req.sessionID ||
      verified.sid !== req.sessionID
    )
      return res.status(400).send("Invalid Session ID");

    const jti = await uuidv4();
    const user = await User.findById(verified.sub as string);
    const newToken = jwt.sign(
      {
        jti: jti,
        sub: user.id,
        iss: process.env.ISSUER,
        sid: req.sessionID,
        typ: "Bearer",
        preferred_username: user.username,
      },
      process.env.TOKEN_SECRET || "",
      {
        expiresIn: "3m",
      }
    );
    /*
    res.header("Authorization", "Bearer" + newToken).send({
      access_token: newToken,
      refresh_token: refreshToken,
      type: "Credential",
    });
    */
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid Token");
  }
};

export default checkTokenMiddleware;
