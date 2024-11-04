import { Request, Response } from "express";
import pool from "../config/db";

export const getThreadComments = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comments = await pool.query(
      `SELECT forum_comments.id, user_id, content, upvotes, downvotes, updated_at as date, user_info.name as uname FROM forum_comments, 
      user_info WHERE thread_id = $1 
      AND forum_comments.user_id = user_info.id ORDER BY date DESC`,
      [id]
    );
    res.json(comments.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { content, user_id, thread_id } = req.body;
  console.log(req.body);
  console.log(thread_id);
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

export const voteComment = async (req: Request, res: Response) => {
  try {
    //check if user has already voted
    const { type, commentId, userId } = req.params;
    const vote = await pool.query(
      `SELECT * FROM comment_votes WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );
    if (vote.rows.length > 0) {
      res.status(400).json("You have already voted");
      return;
    }
    //update comment votes
    const comment = await pool.query(
      `UPDATE forum_comments SET ${type} = ${type} + 1 WHERE id = $1 RETURNING *`,
      [commentId]
    );
    //insert
    await pool.query(
      `INSERT INTO comment_votes (comment_id, user_id, type) VALUES ($1, $2, $3)`,
      [commentId, userId, type === "upvotes" ? 0 : 1]
    );
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
  }
};
