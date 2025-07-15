import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key";

export const handler = async (event) => {
  const tokenString =
    event.authorizationToken || // from API Gateway authorizer
    event.headers?.Authorization || // optional: manual testing
    event.headers?.authorization;

  if (!tokenString || typeof tokenString !== "string") {
    console.log("❌ Missing or invalid Authorization token");
    throw new Error("Unauthorized");
  }

  const token = tokenString.startsWith("Bearer ")
    ? tokenString.slice(7)
    : tokenString;

  console.log("Received token:", token);
  console.log("✅ Authorizer response:", event.methodArn);


  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    return {
      principalId: decoded.username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*"
          }
        ]
      },
      context: {
        username: decoded.username
      }
    };
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    throw new Error("Unauthorized");
  }
};

