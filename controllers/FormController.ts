//@ts-nocheck

import { Request, Response } from "express";
import pool from "../config/db";

export const getForum = async (req: Request, res: Response) => {
  try {
    const forums = await pool.query(
      `SELECT forums.id as id, users.id as userID, users.username, 
      forums.title, forums.created_at, forums.updated_at, forums.tags,
      user_info.name
      FROM forums, users, user_info 
      WHERE forums.creator = users.id AND users.id = user_info.id`
    );
    res.json(forums.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getThreadById = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const forums = await pool.query(
      "SELECT * FROM forums WHERE category = $1",
      [category]
    );
    res.json(forums.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

//TODO: extensive forum search

export const createThread = async (req: Request, res: Response) => {
  const { title, userID } = req.body;
  try {
    //inter into the forums table then insert into the forum_data table

    const forum = await pool
      .query(
        "INSERT INTO forums (title, creator, created_at, updated_at, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          title,
          userID,
          new Date(),
          new Date(),
          ["c21da5e0-b702-4e4b-9450-9390d9f02a42"],
        ]
      )
      .then((forum) => {
        pool.query("INSERT INTO forum_data (id, content) VALUES ($1, $2)", [
          forum.rows[0].id,
          "",
        ]);
      });
    res.json(forum);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateThread = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  try {
    const forum = await pool.query(
      "UPDATE forums SET title = $1, description = $2, category = $3 WHERE id = $4 RETURNING *",
      [title, description, category, id]
    );
    res.json(forum.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const deleteThread = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM forums WHERE id = $1", [id]);
    res.json("Forum was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const reportThread = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const forum = await pool.query(
      "UPDATE forums SET reports = reports + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(forum.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};
