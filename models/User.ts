import pool from "../config/db";

class User {
  id?: string;
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async save() {
    console.log(this.username, this.password);
    try {
      const newUser = await pool.query(
        "INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING *",
        [this.username, this.password]
      );

      await pool.query("INSERT INTO public.user_info (id) VALUES ($1)", [
        newUser.rows[0].id,
      ]);

      return newUser.rows[0];
    } catch (err) {
      return err;
    }
  }

  static async findOne(username: string) {
    try {
      const user = await pool.query(
        "SELECT id, username, password FROM users WHERE username = $1",
        [username]
      );
      //console.log(user);
      return user.rows[0];
    } catch (err) {
      return err;
    }
  }

  static async findById(id: string) {
    try {
      const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      return user.rows[0];
    } catch (err) {
      return err;
    }
  }

  //delete user
  static async delete(id: string) {
    try {
      const user = await pool.query("DELETE FROM users WHERE id = $1", [id]);
      return user.rows[0];
    } catch (err) {
      return err;
    }
  }

  //update user
  static async update(id: string, username: string, password: string) {
    try {
      const user = await pool.query(
        "UPDATE users SET username = $1, password = $2 WHERE id = $3",
        [username, password, id]
      );
      return user.rows[0];
    } catch (err) {
      return err;
    }
  }
}

export default User;
