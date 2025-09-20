const express = require("express");
const cors = require("cors");
const prisma = require("./lib/prisma");

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    // Test Prisma connection
    await prisma.$connect();
    res.json({ 
      message: "Database connection successful!", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`  GET http://localhost:${PORT}/test`);
  console.log(`  GET http://localhost:${PORT}/test-db`);
});
