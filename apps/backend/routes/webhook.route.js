import express from "express";
import { clerkWebHook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Use express.raw for the webhook body, not bodyParser
router.post("/clerk", express.raw({ type: "application/json" }), clerkWebHook);

export default router;