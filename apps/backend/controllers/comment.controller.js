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
    // --- Start of Debugging Logs ---
    console.log("--- Initiating Comment Deletion ---");
    console.log("Attempting to delete comment ID:", commentId);
    console.log("Request from Clerk User ID:", clerkUserId);
    console.log("Clerk Session Claims:", JSON.stringify(req.auth.sessionClaims, null, 2));
    // --- End of Debugging Logs ---

    // Find the comment and its post's author
    const comment = await Comment.findById(commentId).populate({
      path: "post",
      select: "user", // Select the 'user' field from the populated post
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // IMPORTANT: Check for the role in 'publicMetadata' which is the standard for Clerk
    const role = req.auth.sessionClaims?.publicMetadata?.role || "user";
    const isAdmin = role === "admin";

    // Find the current user in your database
    const currentUser = await User.findOne({ clerkUserId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found in DB." });
    }

    const postAuthorId = comment.post.user.toString();
    const currentUserId = currentUser._id.toString();
    const isPostAuthor = postAuthorId === currentUserId;

    // --- Debugging Authorization Check ---
    console.log(`Extracted Role: '${role}'. Is Admin? ${isAdmin}`);
    console.log(`Post Author DB ID: ${postAuthorId}`);
    console.log(`Current User DB ID: ${currentUserId}`);
    console.log(`Is Post Author? ${isPostAuthor}`);
    // ------------------------------------

    // Check if user is authorized
    if (isAdmin || isPostAuthor) {
      await Comment.findByIdAndDelete(commentId);
      const reason = isAdmin ? "by admin" : "by post author";
      console.log(`--- Deletion Successful (${reason}) ---`);
      return res.status(200).json({ message: `Comment deleted successfully ${reason}.` });
    }

    // If neither check passed, deny access
    console.log("--- Deletion Denied: User is not admin or post author. ---");
    return res.status(403).json({ message: "You are not authorized to delete this comment." });

  } catch (error) {
    console.error("--- Deletion Failed with Server Error ---", error);
    return res.status(500).json({ message: "Something went wrong while deleting the comment." });
  }
};