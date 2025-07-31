// File: apps/backend/index.js
import express from "express";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();

// 1. CORS Middleware: Handles cross-origin requests first.
app.use(cors({ origin: process.env.CLIENT_URL }));

// 2. Webhook Router: This route is special and must come BEFORE express.json().
app.use("/webhooks", webhookRouter);

// 3. JSON Body Parser: This middleware is for all other API routes.
app.use(express.json());

// 4. Clerk Middleware: This runs after the body is parsed and protects subsequent routes.
app.use(clerkMiddleware());

// 5. Your API Routers: All these routes are now properly protected.
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

// --- Global Error Handler ---
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