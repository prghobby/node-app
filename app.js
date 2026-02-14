const express = require('express');
const mysql = require('mysql');
const app = express();

// ❌ Vulnerable DB connection (hardcoded credentials)
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password123",
    database: "testdb"
});

// Basic route
app.get("/", (req, res) => {
    res.send("Hello from vulnerable Node.js app");
});

// ✅ Add your SQL injection route RIGHT HERE
app.get("/user", (req, res) => {
    const id = req.query.id;
    const query = "SELECT * FROM users WHERE id = " + id; // ❌ SQL injection
    db.query(query, (err, result) => {
        res.send(result);
    });
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));

