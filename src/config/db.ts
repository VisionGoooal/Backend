import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  mongoose.set('strictQuery', true); 
  try {
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

    await mongoose.connect(process.env.MONGO_URI!);

    console.log(
      `✅ MongoDB Connected to ${
        process.env.NODE_ENV === "test" ? "Test DB" : "Cloud DB"
      }`
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1); // Prevent Jest from crashing during tests
    }
  }
};

export default connectDB;
