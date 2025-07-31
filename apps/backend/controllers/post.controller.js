import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// This function remains the same
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
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
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts due to an internal error." });
  }
};

// This function remains the same
export const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "user",
      "username img clerkUserId"
    );
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post." });
  }
};

// This function remains the same
export const createPost = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Failed to create post.", error: error.message });
  }
};

// --- CORRECTED deletePost FUNCTION ---
export const deletePost = async (req, res) => {
  try {
    const { userId, sessionClaims } = req.auth;
    if (!userId) return res.status(401).json({ message: "Not authenticated!" });

    const role = sessionClaims?.metadata?.role;
    const post = await Post.findById(req.params.id).populate('user', 'clerkUserId');
    if (!post) return res.status(404).json({ message: "Post not found!" });

    // Check if the user is an admin OR is the author of the post
    if (role === "admin" || post.user.clerkUserId === userId) {
      await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Post has been deleted" });
    }

    // If neither, they are not authorized
    return res.status(403).json({ message: "You are not authorized to delete this post!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post due to a server error." });
  }
};

// --- CORRECTED featurePost FUNCTION ---
export const featurePost = async (req, res) => {
  try {
    const { userId, sessionClaims } = req.auth;
    const { postId } = req.body;
    if (!userId) return res.status(401).json({ message: "Not authenticated!" });

    const role = sessionClaims?.metadata?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to feature posts!" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found!" });
    
    post.isFeatured = !post.isFeatured;
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to feature post due to a server error." });
  }
};

// This function remains the same
const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

// This function remains the same
export const uploadAuth = async (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to get ImageKit auth." });
  }
};