import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { clerkClient } from "@clerk/clerk-sdk-node";



export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const query = {};
  const { cat, author, search: searchQuery, sort: sortQuery, featured } = req.query;

  if (cat) query.category = cat;
  if (searchQuery) query.title = { $regex: searchQuery, $options: "i" };
  if (featured) query.isFeatured = true;

  if (author) {
    const user = await User.findOne({ username: author }).select("_id");
    if (!user) return res.status(200).json({ posts: [], hasMore: false });
    query.user = user._id;
  }

  let sortObj = { createdAt: -1 };
  if (sortQuery) {
    switch (sortQuery) {
      case "oldest": sortObj = { createdAt: 1 }; break;
      case "popular": sortObj = { visit: -1 }; break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
    }
  }

  const posts = await Post.find(query)
    .populate("user", "username clerkUserId")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await Post.countDocuments(query);
  const hasMore = page * limit < totalPosts;
  res.status(200).json({ posts, hasMore });
};

export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img clerkUserId"
  );
  res.status(200).json(post);
};

export const createPost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) return res.status(401).json({ message: "Not authenticated!" });

  const user = await User.findOne({ clerkUserId });
  if (!user) return res.status(404).json({ message: "User not found in the database!" });
  if (!req.body.title) return res.status(400).json({ message: "Post title is required." });

  let slug = req.body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  let existingPost = await Post.findOne({ slug });
  let counter = 2;
  while (existingPost) {
    slug = `${req.body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }

  const newPost = new Post({ user: user._id, slug, ...req.body });
  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role === "admin") {
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post has been deleted");
  }

  const user = await User.findOne({ clerkUserId });
  const deletedPost = await Post.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedPost) {
    return res.status(403).json("You can delete only your posts!");
  }

  res.status(200).json("Post has been deleted");
};

export const updatePost = async (req, res) => {
  const { userId } = req.auth;
  const postId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }

  try {
    const localUser = await User.findOne({ clerkUserId: userId });
    if (!localUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const isAdmin = clerkUser.publicMetadata.role === "admin";

    // Authorization check: only author or admin can edit
    if (post.user.toString() !== localUser._id.toString() && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to edit this post." });
    }

    // Handle slug regeneration if title changes
    let newSlug = post.slug;
    if (req.body.title && req.body.title !== post.title) {
      newSlug = req.body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      let existingPost = await Post.findOne({ slug: newSlug, _id: { $ne: postId } });
      let counter = 2;
      while (existingPost) {
        newSlug = `${req.body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${counter}`;
        existingPost = await Post.findOne({ slug: newSlug, _id: { $ne: postId } });
        counter++;
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { ...req.body, slug: newSlug },
      { new: true } // This option returns the updated document
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


export const featurePost = async (req, res) => {
  const { userId } = req.auth;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to perform this action!" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.status(200).json({ message: `Post has been ${post.isFeatured ? "featured" : "un-featured"}.` });
  } catch (error) {
    console.error("Error in featurePost controller:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export const uploadAuth = async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};