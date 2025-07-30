import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Clerk Webhook secret needed!");
  }

  // Get the headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: "Error occured -- no svix headers" });
  }

  // Get the body
  const payload = req.body;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({ message: "Webhook verification failed!" });
  }

  // Get the event type
  const { type } = evt;

  console.log(`Webhook with an event type of ${type}`);

  if (type === "user.created") {
    try {
      await User.create({
        clerkUserId: evt.data.id,
        username: evt.data.username || `${evt.data.first_name} ${evt.data.last_name}`,
        email: evt.data.email_addresses[0].email_address,
        img: evt.data.image_url,
      });
      console.log("User created in DB:", evt.data.id);
    } catch (dbError) {
      console.error("Error creating user in DB:", dbError);
    }
  }

  if (type === "user.deleted") {
    try {
      const deletedUser = await User.findOneAndDelete({ clerkUserId: evt.data.id });
      if (deletedUser) {
        await Post.deleteMany({ user: deletedUser._id });
        await Comment.deleteMany({ user: deletedUser._id });
        console.log("User and their content deleted from DB:", evt.data.id);
      }
    } catch (dbError) {
      console.error("Error deleting user from DB:", dbError);
    }
  }

  res.status(200).json({ message: "Webhook processed" });
};