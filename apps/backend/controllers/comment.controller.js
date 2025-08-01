import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getPostComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate("user", "username img")
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
  const clerkUserId = req.auth.userId;
  const commentId = req.params.id;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }

  try {
    // 1. Find the comment and populate the post to get the post author's ID
    const comment = await Comment.findById(commentId).populate({
      path: "post",
      select: "user", // We only need the user field from the Post document
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // 2. Check if the current user is an admin
    const role = req.auth.sessionClaims?.metadata?.role || "user";
    if (role === "admin") {
      await Comment.findByIdAndDelete(commentId);
      return res.status(200).json({ message: "Comment deleted successfully by admin." });
    }

    // 3. If not an admin, check if the current user is the post's author
    const currentUser = await User.findOne({ clerkUserId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Convert ObjectId to string for comparison
    const postAuthorId = comment.post.user.toString();
    const currentUserId = currentUser._id.toString();

    if (postAuthorId === currentUserId) {
      await Comment.findByIdAndDelete(commentId);
      return res.status(200).json({ message: "Comment deleted successfully by post author." });
    }

    // 4. If neither condition is met, deny permission
    return res.status(403).json({ message: "You are not authorized to delete this comment." });
    
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};