import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import fs from "fs";

dotenv.config();

// Ensure uploads directory exists (Render has ephemeral filesystem)
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

// Validate critical environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("Please set these in your Render environment settings.");
  process.exit(1);
}

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`MONGO_URI set: ${!!process.env.MONGO_URI}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || "not set (CORS may fail)"}`);
});