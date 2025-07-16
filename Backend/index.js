// index.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");


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



app.listen(3000, () => {
  console.log("🕺 Dance API running on http://localhost:3000");
});
