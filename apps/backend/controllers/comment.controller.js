import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { clerkClient } from "@clerk/express/node"; // <-- THIS LINE WAS MISSING

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
    const clerkUser = await clerkClient.users.getUser(userId);
    const localUser = await User.findOne({ clerkUserId: userId });

    if (!localUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ message: "Associated post not found." });
    }

    const isAdmin = clerkUser.publicMetadata.role === "admin";
    const isPostAuthor = post.user.toString() === localUser._id.toString();
    const isCommentAuthor = comment.user.toString() === localUser._id.toString();

    if (!isAdmin && !isPostAuthor && !isCommentAuthor) {
      return res.status(403).json({ message: "You are not authorized to delete this comment." });
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment has been deleted successfully." });
    
  } catch (error) {
    console.error("!!! CRITICAL ERROR IN deleteComment:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};