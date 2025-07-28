import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

export const User = mongoose.model('User', userSchema);