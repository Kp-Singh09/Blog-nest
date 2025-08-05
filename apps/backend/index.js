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

app.use(cors({ origin: process.env.CLIENT_URL }));

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