/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from "express";
import pool from "../config/db";
import jwt from "jsonwebtoken";

//getUsers, getUserById, updateUser, deleteUser

export const getUsers = async (req: Request, res: Response) => {
  console.log("getUsers");
  try {
    const users = await pool.query(
      "SELECT users.id, users.username, name, role, pfp FROM users, user_info WHERE users.id = user_info.id"
    );
    console.log(req.session.cookie);
    res.json(users.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await pool.query(
      "SELECT users.username, users.id, user_info.name, user_info.email, user_info.phone, user_info.role, user_info.pfp FROM users, user_info WHERE users.id = $1 and users.id = user_info.id",
      [id]
    );
    res.json(user.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id, name, email, phone, role, pfp } = req.body;
  try {
    const user = await pool.query(
      "UPDATE user_info SET name = $1, email = $2, phone = $3, role = $4, pfp = $5 WHERE id = $6",
      [name, email, phone, role, pfp, id]
    );
    res.json("User was updated");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    console.log("User was deleted");
    await pool.query("DELETE FROM user_info WHERE id = $1", [id]);
    console.log("User INFO was deleted");
    res.json("User was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const uploadUserImage = async (req: Request, res: Response) => {
  //get id from header token
  const token = req.header("Authorization") || "";
  const decoded = jwt.decode(token.split(" ")[1]);
  const id = decoded?.sub;

  const { image } = req.body;
  //console.log(req.body);
  //console.log(image);

  try {
    await pool.query("UPDATE public.user_info SET pfp = $1 WHERE id = $2", [
      image,
      id,
    ]);
    res.json("Image was uploaded");
    // console.log("Image was uploaded");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getUserImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await pool.query("SELECT pfp FROM user_info WHERE id = $1", [
      id,
    ]);
    res.json(user.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getPersonalPfp = async (req: Request, res: Response) => {
  const token = req.header("Authorization") || "";
  const decoded = jwt.decode(token.split(" ")[1]);
  const id = decoded?.sub;

  try {
    const user = await pool.query("SELECT pfp FROM user_info WHERE id = $1", [
      id,
    ]);
    //send back the image
    res.json(user.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};
