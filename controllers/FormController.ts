//@ts-nocheck

import { Request, Response } from "express";
import pool from "../config/db";

export const getForum = async (req: Request, res: Response) => {
  try {
    const forums = await pool.query(
      `SELECT 
    forums.id as id, 
    users.id as userID, 
    users.username, 
    forums.title, 
    forums.created_at, 
    forums.updated_at,
    user_info.name, 
    COALESCE(array_agg(tags.name), ARRAY[]::varchar[]) as tag_names
FROM 
    forums
JOIN 
    users ON forums.creator = users.id
JOIN 
    user_info ON users.id = user_info.id
LEFT JOIN 
    unnest(forums.tags) as tag_id ON true
LEFT JOIN 
    public.tags ON tags.id = tag_id
GROUP BY 
    forums.id, 
    users.id, 
    users.username, 
    forums.title, 
    forums.created_at, 
    forums.updated_at,
    user_info.name
ORDER BY
    forums.created_at DESC
LIMIT 
  $1
OFFSET
  $2
`,
      [req.query.limit, req.query.offset]
    );

    const pages = await pool.query(
      `SELECT 
  COUNT(*) as total
FROM
  forums
`,
      []
    );
    res.json({ forums: forums.rows, total: Number(pages.rows[0].total) });
  } catch (err: any) {
    console.error(err.message);
  }
};

export const filterForum = async (req: Request, res: Response) => {
  //filter by tag_id or/and name, username, title and return like getForum
  const { tag_id, name, username, title, limit, offset } = req.query;

  try {
    const forums = await pool.query(
      `SELECT 
    forums.id as id, 
    users.id as userID, 
    users.username, 
    forums.title, 
    forums.created_at, 
    forums.updated_at,
    user_info.name, 
    COALESCE(array_agg(tags.name), ARRAY[]::varchar[]) as tag_names
FROM 
    forums
JOIN 
    users ON forums.creator = users.id
JOIN 
    user_info ON users.id = user_info.id
LEFT JOIN 
    unnest(forums.tags) as tag_id ON true
LEFT JOIN 
    public.tags ON tags.id = tag_id
WHERE
    tags.id = $1 OR
    users.username = $2 OR
    user_info.name = $3 OR
    forums.title = $4
GROUP BY

    forums.id, 
    users.id, 
    users.username, 
    forums.title, 
    forums.created_at, 
    forums.updated_at,
    user_info.name
ORDER BY
    forums.created_at DESC
LIMIT
    $5
OFFSET
    $6
`,
      [tag_id, username, name, title, limit, offset]
    );

    const pages = forums.rows.length;

    res.json({ forums: forums.rows, total: pages });
  } catch (err: any) {
    console.error(err.message);
  }
};

export const getThreadById = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  try {
    const forums = await pool.query(
      `SELECT
    forums.id as id,
    forums.creator,
    forums.title,
    forums.created_at,
    forums.updated_at,
    forum_data.content,
    COALESCE(array_agg(tags.name), ARRAY[]::varchar[]) as tag_names
FROM
    forums
LEFT JOIN
    forum_data ON forums.id = forum_data.id
LEFT JOIN
    unnest(forums.tags) as tag_id ON true
LEFT JOIN
    public.tags ON tags.id = tag_id
WHERE
    forums.id = $1
GROUP BY
    forums.id,
    forums.title,
    forums.created_at,
    forums.updated_at,
    forum_data.content
`,
      [id]
    );
    res.json(forums.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
};

//TODO: extensive forum search

export const createThread = async (req: Request, res: Response) => {
  const { title, userID, tags, content } = req.body;
  try {
    //inter into the forums table then insert into the forum_data table

    const forum = await pool
      .query(
        "INSERT INTO forums (title, creator, created_at, updated_at, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, userID, new Date(), new Date(), tags]
      )
      .then((forum) => {
        pool.query("INSERT INTO forum_data (id, content) VALUES ($1, $2)", [
          forum.rows[0].id,
          content,
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
