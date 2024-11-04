import { Request, Response } from "express";
import pool from "../config/db";

export const getThreadComments = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comments = await pool.query(
      "SELECT * FROM forum_comments WHERE thread_id = $1",
      [id]
    );
    res.json(comments.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { content, thread_id, user_id } = req.body;
  try {
    const comment = await pool.query(
      "INSERT INTO forum_comments (content, thread_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [content, thread_id, user_id, new Date(), new Date()]
    );
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const comment = await pool.query(
      "UPDATE forum_comments SET content = $1, updated_at = $2 WHERE id = $3 RETURNING *",
      [content, new Date(), id]
    );
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM forum_comments WHERE id = $1", [id]);
    console.log("Comment was deleted");
    res.json("Comment was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const upvoteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comment = await pool.query(
      "UPDATE forum_comments SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(comment.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const downvoteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comment = await pool.query(
      "UPDATE forum_comments SET downvotes = downvotes + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(comment.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};
