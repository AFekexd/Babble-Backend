import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "your-username",
  host: "your-host",
  database: "your-database",
  password: "your-password",
  port: 5432,
});

export default pool;
