import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { signupInput, signinInput, createPostInput, updatePostInput } from "@blog-nest/common";
// Import Mongoose Models
import { User } from './models/user';
import { Post } from './models/post';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const mongoURL = process.env.MONGO_URL;
if (!mongoURL) {
  console.error("MONGO_URI not defined in .env file");
  process.exit(1);
}
mongoose.connect(mongoURL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- JWT Middleware ---
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET as string) as { id: string };
    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// --- Routes ---

// Signup
app.post('/api/v1/signup', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = signupInput.safeParse({ name, email, password });

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const existingUser = await User.findOne({ email: result.data.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 10);

    const user = await User.create({
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
    res.status(200).json({ jwt: token, name: user.name, id: user._id });

  } catch (error) {
    return res.status(500).json({ error: 'Error while signing up' });
  }
});

// Signin
app.post('/api/v1/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = signinInput.safeParse({ email, password });
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const user = await User.findOne({ email: result.data.email });
    if (!user) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(result.data.password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
    res.status(200).json({ jwt: token, name: user.name, id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Blog Post
app.post('/api/v1/blog', authenticate, async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const result = createPostInput.safeParse({ title, content });

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const userId = (req as any).userId;
    const post = await Post.create({
      title: result.data.title,
      content: result.data.content,
      author: userId,
    });

    // Also push the post reference to the user's document
    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    return res.json({ id: post._id });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the post' });
  }
});

// Update Blog Post
app.put('/api/v1/blog', authenticate, async (req: Request, res: Response) => {
  const { id, title, content } = req.body;
  const result = updatePostInput.safeParse({ id, title, content });

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const userId = (req as any).userId;
    const post = await Post.findOneAndUpdate(
      { _id: result.data.id, author: userId }, // Condition to ensure user owns the post
      { title: result.data.title, content: result.data.content },
      { new: true } // Return the updated document
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found or you do not have permission to edit it' });
    }

    return res.status(200).json({ message: 'Updated post' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the post' });
  }
});

// Delete Blog Post
app.delete('/api/v1/blog/:id', authenticate, async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = (req as any).userId;
    try {
        const post = await Post.findOneAndDelete({ _id: id, author: userId });

        if (!post) {
            return res.status(404).json({ error: 'Post not found or you do not have permission to delete it' });
        }
        
        // Remove the post from the user's posts array
        await User.findByIdAndUpdate(userId, { $pull: { posts: post._id } });

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred' });
    }
});


// Get Single Blog Post by ID
app.get('/api/v1/blog/:id', authenticate, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id).select('id title content'); // Mongoose uses _id, but id works as a virtual

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred' });
  }
});

// Get All Blog Posts
app.get('/api/v1/all-blog', authenticate, async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name') // Populate author's name
      .select('id title content createdAt author');

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred while fetching posts' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});