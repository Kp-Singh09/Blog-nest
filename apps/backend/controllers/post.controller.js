import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const getPosts = async (req, res) => {
  console.log("=> Request received to fetch posts."); // Log at the start

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const query = {};

    const cat = req.query.cat;
    const author = req.query.author;
    const searchQuery = req.query.search;
    const sortQuery = req.query.sort;
    const featured = req.query.featured;

    if (cat) {
      query.category = cat;
    }

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
      const user = await User.findOne({ username: author }).select("_id");

      if (!user) {
        return res.status(200).json({ posts: [], hasMore: false });
      }

      query.user = user._id;
    }

    let sortObj = { createdAt: -1 };

    if (sortQuery) {
      switch (sortQuery) {
        case "newest":
          sortObj = { createdAt: -1 };
          break;
        case "oldest":
          sortObj = { createdAt: 1 };
          break;
        case "popular":
          sortObj = { visit: -1 };
          break;
        case "trending":
          sortObj = { visit: -1 };
          query.createdAt = {
            $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          };
          break;
        default:
          break;
      }
    }

    if (featured) {
      query.isFeatured = true;
    }

    console.log("=> Querying the database...");
    const posts = await Post.find(query)
      .populate("user", "username clerkUserId")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);
    const hasMore = page * limit < totalPosts;

    console.log(`=> Found ${posts.length} posts. Sending response.`); // Log at the end
    res.status(200).json({ posts, hasMore });

  } catch (error) {
    console.error("!!! Error in getPosts controller:", error);
    res.status(500).json({ message: "Failed to fetch posts due to an internal error." });
  }
};

export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img clerkUserId"
  );
  res.status(200).json(post);
};

export const createPost = async (req, res) => {
  console.log("==> Attempting to create a new post...");

  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json("Not authenticated!");
    }

    console.log("Body received by server:", req.body);

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json("User not found in the database!");
    }

    if (!req.body.title) {
      return res.status(400).json({ message: "Post title is required." });
    }

    let slug = req.body.title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
  .replace(/\s+/g, '-') // Replace spaces with a single hyphen
  .replace(/-+/g, '-'); // Replace multiple hyphens with a single one

    let existingPost = await Post.findOne({ slug });
    let counter = 2;

    while (existingPost) {
      slug = `${req.body.title.replace(/ /g, "-").toLowerCase()}-${counter}`;
      existingPost = await Post.findOne({ slug });
      counter++;
    }

    const newPost = new Post({ user: user._id, slug, ...req.body });

    const post = await newPost.save();

    console.log("==> Post created successfully!");
    res.status(200).json(post);

  } catch (error) {
    console.error("!!! ERROR in createPost controller:", error);
    res.status(500).json({ message: "Failed to create post.", error: error.message });
  }
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
  // Correctly destructure sessionClaims from req.auth
  const { userId, sessionClaims } = req.auth;
  const { postId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
  
  // Use the sessionClaims to get the role
  const role = sessionClaims?.metadata?.role || "user";

  if (role !== "admin") {
    return res.status(403).json({ message: "You are not authorized to feature posts!" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    // Toggle the isFeatured status
    post.isFeatured = !post.isFeatured;
    const updatedPost = await post.save();
    
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error in featurePost:", error);
    res.status(500).json({ message: "Failed to feature post due to a server error." });
  }
};

// Add these console.log statements for debugging
console.log("--- IMAGEKIT ENV CHECK ---");
console.log("Public Key Loaded:", !!process.env.IK_PUBLIC_KEY);
console.log("Private Key Loaded:", !!process.env.IK_PRIVATE_KEY);
console.log("URL Endpoint Loaded:", !!process.env.IK_URL_ENDPOINT);
console.log("--------------------------");

const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export const uploadAuth = async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};