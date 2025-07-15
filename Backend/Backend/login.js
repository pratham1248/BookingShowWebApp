import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const SECRET_KEY = "your-secret-key"; // Store securely using environment variables

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "❌ Missing username or password." }),
      };
    }

    // Get user from DynamoDB
    const command = new GetCommand({
      TableName: "Userdata",
      Key: { username }
    });

    const result = await client.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "❌ User not found." }),
      };
    }

    const storedHash = result.Item.password;
    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ valid: false, message: "❌ Invalid credentials." }),
      };
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { username },
      SECRET_KEY,
      { expiresIn: "2h", issuer: "https://yourdomain.com", audience: "dance-booking-app" }
    );

    // ✅ Return token to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        message: "✅ Login successful.",
        token
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "❌ Server error", error: error.message }),
    };
  }
};
