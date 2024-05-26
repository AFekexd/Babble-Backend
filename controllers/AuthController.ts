//@ts-nocheck
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { deleteSession, uploadSession } from "../middlewares/SessionHandler";

export const register = async (req: Request, res: Response) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User(req.body.username, hashedPassword);

  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const login = async (req: Request, res: Response) => {
  console.log(req.sessionID);
  const user = await User.findOne(req.body.username);
  if (!user) return res.status(400).send("Username or password is wrong");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");
  const jti = await uuidv4();
  const token = jwt.sign(
    {
      jti: jti,
      sub: user.id,
      iss: process.env.ISSUER,
      typ: "Bearer",
      preferred_username: user.username,
      sid: req.sessionID,
    },
    process.env.TOKEN_SECRET || "",
    {
      expiresIn: "3m",
    }
  );
  await uploadSession(req, user.id);

  res.header("Authorization", "Bearer " + token).send({
    access_token: token,
    refresh_token: await generateRefreshToken(jti, user, req.sessionID),
    type: "Credential",
  });
};

export const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET || "");
    if (req.sessionID !== verified.sid)
      return res.status(400).send("Invalid Token");
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

//refresh token

const generateRefreshToken = async (jti: string, user: User, sid: string) => {
  return jwt.sign(
    {
      iss: process.env.ISSUER,
      jti: jti,
      typ: "Refresh",
      sub: user.id,
      sid: sid,
    },
    process.env.TOKEN_SECRET || "",
    { expiresIn: "1h" }
  );
};

export const refreshToken = async (req: Request, res: Response) => {
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

    res.header("Authorization", "Bearer" + newToken).send({
      access_token: newToken,
      refresh_token: refreshToken,
      type: "Credential",
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid Token");
  }
};

export const logout = async (req: Request, res: Response) => {
  console.log("LOGOUT");
  // console.log(req);
  await deleteSession(req.sessionID);

  req.session.destroy((err) => {
    if (err) {
      //console.log(err);
      res.status(400).send("Failed to logout");
    }
    res.status(200).send("Logged out");
  });
};
//TODO SESSION DB TAROLNI
