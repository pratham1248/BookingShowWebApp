// index.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const mysql = require("mysql2/promise");

const cors = require("cors");

const app = express();

// ✅ Enable CORS for all origins
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
console.log("Region:", process.env.AWS_REGION);

app.post("/LoginUser", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "❌ Missing username or password." });
    }

    const command = new GetCommand({
      TableName: "Userdata",
      Key: { username }
    });

    const result = await client.send(command);

    if (!result.Item) {
      return res.status(404).json({ message: "❌ User not found." });
    }

    const storedHash = result.Item.password;
    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (!passwordMatch) {
      return res.status(401).json({ valid: false, message: "❌ Invalid credentials." });
    }

    const token = jwt.sign(
      { username },
      SECRET_KEY,
      { expiresIn: "2h", issuer: "https://yourdomain.com", audience: "dance-booking-app" }
    );

    return res.status(200).json({
      valid: true,
      message: "✅ Login successful.",
      token
    });

  } catch (error) {
    return res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});


app.post("/SubmitData", async (req, res) => {
  try {
    const { name, contact, username, password } = req.body;

    if (!name || !contact || !username || !password) {
      return res.status(400).json({ message: "❌ All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const command = new PutCommand({
      TableName: "Userdata",
      Item: {
        username,
        name,
        contact,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      },
      ConditionExpression: "attribute_not_exists(username)"
    });

    await client.send(command);

    res.status(201).json({ message: "✅ Signup successful!" });

  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return res.status(409).json({ message: "❌ Username already exists." });
    }
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});



app.get("/cities", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute("SELECT * FROM City");

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ DB Error:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});



app.post("/slots", async (req, res) => {
  const { city_id } = req.body;

  if (!city_id) {
    return res.status(400).json({ message: "❌ city_id is required" });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute(
      "SELECT * FROM Slot WHERE city_id = ?",
      [city_id]
    );

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ DB Error:", error.message);
    res.status(500).json({ message: "❌ Failed to fetch slots", error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.post("/bookedSlots", async (req, res) => {
  const { username, city_id } = req.body;

  if (!username || !city_id) {
    return res.status(400).json({ message: "❌ username and city_id are required" });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute(
      `
      SELECT b.slot_id
      FROM Booking b
      JOIN Slot s ON b.slot_id = s.slot_id
      WHERE b.username = ? AND s.city_id = ?
      `,
      [username, city_id]
    );

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Query Error:", error.message);
    res.status(500).json({
      message: "❌ Failed to fetch booked slots",
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});


app.post("/bookSlot", async (req, res) => {
  const { username, slot_id } = req.body;

  if (!username || !slot_id) {
    return res.status(400).json({ message: "❌ username and slot_id are required" });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // 1️⃣ Insert booking record
    await connection.execute(
      `
      INSERT INTO Booking (username, slot_id, booking_date)
      VALUES (?, ?, CURDATE())
      `,
      [username, slot_id]
    );

    // 2️⃣ Decrease available seats only if seats > 0
    const [updateResult] = await connection.execute(
      `
      UPDATE Slot
      SET available_seats = available_seats - 1
      WHERE slot_id = ? AND available_seats > 0
      `,
      [slot_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(409).json({ message: "❌ No available seats for this slot" });
    }

    await connection.commit();
    res.status(200).json({ message: "✅ Booking successful" });

  } catch (error) {
    console.error("❌ Booking Error:", error.message);
    res.status(500).json({ message: "❌ Booking failed", error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.listen(3000, () => {
  console.log("🕺 Dance API running on http://localhost:3000");
});
