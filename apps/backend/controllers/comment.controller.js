import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getPostComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate("user", "username img clerkUserId")
    .sort({ createdAt: -1 });

  res.json(comments);
};

export const addComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.params.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  const newComment = new Comment({
    ...req.body,
    user: user._id,
    post: postId,
  });

  const savedComment = await newComment.save();

  res.status(201).json(savedComment);
};

export const deleteComment = async (req, res) => {
  const { userId } = req.auth;
  const commentId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }

  try {
    // --- Step 1: Add detailed logs ---
    console.log("--- Starting Comment Deletion Process ---");
    console.log(`Attempting to delete comment with ID: ${commentId} by user: ${userId}`);

    const clerkUser = await clerkClient.users.getUser(userId);
    console.log("Clerk user fetched successfully.");

    const localUser = await User.findOne({ clerkUserId: userId });
    console.log("Local user fetched:", localUser ? localUser._id.toString() : "Not Found");

    if (!localUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    const comment = await Comment.findById(commentId);
    console.log("Comment to delete fetched:", comment ? comment.toObject() : "Not Found");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const post = await Post.findById(comment.post);
    console.log("Associated post fetched:", post ? post.toObject() : "Not Found");

    if (!post) {
      return res.status(404).json({ message: "Associated post not found." });
    }

    // --- Step 2: Log values just before the check ---
    console.log("--- Checking Permissions ---");
    const isAdmin = clerkUser.publicMetadata.role === "admin";
    const isPostAuthor = post.user.toString() === localUser._id.toString();
    const isCommentAuthor = comment.user.toString() === localUser._id.toString();
    console.log(`Is Admin: ${isAdmin}, Is Post Author: ${isPostAuthor}, Is Comment Author: ${isCommentAuthor}`);
    
    if (!isAdmin && !isPostAuthor && !isCommentAuthor) {
      return res.status(403).json({ message: "You are not authorized to delete this comment." });
    }

    console.log("Permissions check passed. Deleting comment...");
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment has been deleted successfully." });

  } catch (error) {
    // --- Step 3: Log the specific error that caused the crash ---
    console.error("!!! CRITICAL ERROR IN deleteComment:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};