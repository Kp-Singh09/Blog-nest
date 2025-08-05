import express from "express";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import statsRouter from "./routes/stats.route.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();

// --- CRITICAL FIX FOR CORS ---
const clientUrl = process.env.CLIENT_URL;

// Add a log to check the environment variable during deployment
console.log("CLIENT_URL for CORS:", clientUrl);

if (!clientUrl) {
  console.error("FATAL ERROR: CLIENT_URL is not defined.");
  // Optionally, you can prevent the app from starting if the URL is missing
  // process.exit(1); 
}

const allowedOrigins = [clientUrl?.replace(/\/$/, "")]; // Remove trailing slash if present

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/webhooks", webhookRouter);
app.use("/stats", statsRouter);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((error, req, res, next) => {
  console.error("!!! Global Error Handler caught an error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong!",
  });
});

app.listen(3000, () => {
  connectDB();
  console.log("Server is running!");
});