import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt"; // Requires native compilation

const client = new DynamoDBClient({});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, contact, username, password } = body;

    if (!name || !contact || !username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "❌ All fields are required." }),
      };
    }

    // 🔐 Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📦 Prepare DynamoDB PutCommand
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

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "✅ Signup successful!" }),
    };

  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "❌ Username already exists." }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "❌ Server error", error: error.message }),
    };
  }
};
