import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const Post = mongoose.model('Post', postSchema);