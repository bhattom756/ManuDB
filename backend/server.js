const express = require("express");
const pkg = require("pg");
const cors = require("cors");
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// setup PostgreSQL connection
const pool = new Pool({
  user: "your_username",   // your postgres username
  host: "localhost",
  database: "your_dbname", // your postgres database
  password: "your_password",
  port: 5432,              // default port
});

// test route
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
