// File: apps/backend/routes/webhook.route.js
import express from "express";
import { clerkWebHook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Use the modern express.raw() parser for webhook verification
router.post("/clerk", express.raw({ type: "application/json" }), clerkWebHook);

export default router;