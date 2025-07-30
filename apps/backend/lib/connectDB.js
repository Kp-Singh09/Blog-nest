import mongoose from "mongoose";

mongoose.set("debug", true); // <-- ADD THIS LINE

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
    });
    console.log("MongoDB is connected");
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;