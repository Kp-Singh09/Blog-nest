import express from "express";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();

console.log("Setting up middleware...");

// --- MIDDLEWARE WITH LOGGING ---

app.use((req, res, next) => {
  console.log(`[1] Request received: ${req.method} ${req.url}`);
  next();
});

app.use(cors({ origin: process.env.CLIENT_URL }));

app.use((req, res, next) => {
  console.log("[2] After CORS middleware.");
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log("[3] After express.json middleware.");
  next();
});

app.use(clerkMiddleware());

app.use((req, res, next) => {
  console.log("[4] After clerkMiddleware.");
  next();
});

// --- ROUTERS ---
app.use("/webhooks", webhookRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

console.log("Routers have been set up.");

// --- ERROR HANDLER ---
app.use((error, req, res, next) => {
  console.error("!!! Global Error Handler caught an error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong!",
    status: error.status,
  });
});

app.listen(3000, () => {
  connectDB();
  console.log("Server is running!");
});