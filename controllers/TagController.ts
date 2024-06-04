import { Request, Response } from "express";
import pool from "../config/db";

export const searchTags = async (req: Request, res: Response) => {
  //search with like
  const { name } = req.params;
  if (!name) return res.status(400).send("No search query");
  if (name.length < 3) return res.status(400).send("Search query too short");
  if (name.length > 100) return res.status(400).send("Search query too long");

  try {
    const tags = await pool.query(
      "SELECT id, name FROM tags WHERE name LIKE '%' || $1 || '%'",
      [name]
    );

    res.json(tags.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const createTag = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newTag = await pool.query(
      "INSERT INTO tags (name) VALUES($1) RETURNING *",
      [name]
    );
    res.json(newTag.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tags WHERE id = $1", [id]);
    res.json("Tag was deleted");
  } catch (err: any) {
    console.error(err.message);
  }
};

//getTagById
export const getTagById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const tag = await pool.query("SELECT id, name FROM tags WHERE id = $1", [
      id,
    ]);
    res.json(tag.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

//paginateTags
export const paginateTags = async (req: Request, res: Response) => {
  const { page } = req.params;
  try {
    const tags = await pool.query(
      "SELECT id, name FROM tags ORDER BY created_at DESC LIMIT 10 OFFSET $1",
      [page]
    );
    res.json(tags.rows);
  } catch (err: any) {
    console.error(err.message);
  }
};
