import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

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

export const featurePost = async (req, res) => {
  // This function will remain but will not be used by the reverted frontend.
  res.status(403).json({ message: "Feature functionality is disabled." });
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