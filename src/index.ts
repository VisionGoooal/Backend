import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import postsRoutes from "./routes/postRoutes";
import commentsRoutes from "./routes/commentRoutes";
import authRoutes from "./routes/authRoutes";
import { Server } from "socket.io";
import { chatSocket } from "./socket/chatSocket";
import multer from "multer";
import path from "path";
import fs from "fs";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Ensure the uploads directory exists (no need to do this in the controller, handled in server file)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory is created if it doesn't exist
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to the MongoDB database successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the images from the 'uploads' directory
app.use("/uploads", express.static(uploadDir)); // This serves the static files from the 'uploads' folder

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique filename
  },
});

const upload = multer({ storage });

// Define routes
app.use("/post", postsRoutes);
app.use("/comment", commentsRoutes);
app.use("/auth", authRoutes);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Set up socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

chatSocket(io);
