//getForums, getForumsByCategory, getForumById, createForum, updateForum, deleteForum

import { Request, Response } from "express";
import pool from "../config/db";

export const getForums = async (req: Request, res: Response) => {
  try {
    const forums = await pool.query("SELECT * FROM forums");
    res.json(forums.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getForumsByCategory = async (req: Request, res: Response) => {
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

export const getForumById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const forum = await pool.query("SELECT * FROM forums WHERE id = $1", [id]);
    res.json(forum.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createForum = async (req: Request, res: Response) => {
  const { title, description, category } = req.body;
  try {
    const forum = await pool.query(
      "INSERT INTO forums (title, description, category) VALUES ($1, $2, $3) RETURNING *",
      [title, description, category]
    );
    res.json(forum.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateForum = async (req: Request, res: Response) => {
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

export const deleteForum = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM forums WHERE id = $1", [id]);
    res.json("Forum was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getForumPosts = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const posts = await pool.query("SELECT * FROM posts WHERE forum_id = $1", [
      id,
    ]);
    res.json(posts.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getForumPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    res.json(post.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createForumPost = async (req: Request, res: Response) => {
  const { title, content, forum_id } = req.body;
  try {
    const post = await pool.query(
      "INSERT INTO posts (title, content, forum_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, forum_id]
    );
    res.json(post.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateForumPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const post = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *",
      [title, content, id]
    );
    res.json(post.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const deleteForumPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json("Post was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comments = await pool.query(
      "SELECT * FROM comments WHERE post_id = $1",
      [id]
    );
    res.json(comments.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comment = await pool.query("SELECT * FROM comments WHERE id = $1", [
      id,
    ]);
    res.json(comment.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { content, post_id } = req.body;
  try {
    const comment = await pool.query(
      "INSERT INTO comments (content, post_id) VALUES ($1, $2) RETURNING *",
      [content, post_id]
    );
    res.json(comment.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const comment = await pool.query(
      "UPDATE comments SET content = $1 WHERE id = $2 RETURNING *",
      [content, id]
    );
    res.json(comment.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

//searchTag
export const searchTag = async (req: Request, res: Response) => {
  const { tag } = req.params;
  try {
    const forums = await pool.query(
      "SELECT id FROM forums WHERE tags Like '%$1%'",
      [tag]
    );
    res.json(forums.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

//createTag
export const createTag = async (req: Request, res: Response) => {
  const { tag } = req.body;
  try {
    const newTag = await pool.query(
      "INSERT INTO tags (tag) VALUES ($1) RETURNING *",
      [tag]
    );
    res.json(newTag.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};
