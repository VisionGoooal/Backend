import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

    await mongoose.connect(uri as string, {
      useNewUrlParser: true,        // Fixes the URL string parser deprecation warning
      useUnifiedTopology: true,     // Fixes the Server Discovery and Monitoring engine warning
      useCreateIndex: true,         // Fixes the ensureIndex deprecation warning
    });

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
