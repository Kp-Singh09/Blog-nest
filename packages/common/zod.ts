import { z } from 'zod';

// Schema for user signup
export const signupInput = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

// Schema for user signin
export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

// Schema for creating a blog post
export const createPostInput = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    content: z.string().min(1, "Content cannot be empty")
});

// Schema for updating a blog post
export const updatePostInput = z.object({
    id: z.string(), // MongoDB IDs are strings
    title: z.string().optional(),
    content: z.string().optional()
});

// Export types for type inference if needed elsewhere
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type CreatePostInput = z.infer<typeof createPostInput>;
export type UpdatePostInput = z.infer<typeof updatePostInput>;