import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from 'mongoose';
import multer from "multer";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import * as http from 'http';

// Import Routes
import authRoutes from "./routes/authRoutes";
import predictionRoutes from "./routes/predictionRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();
const app: Express = express();

// ✅ Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ CORS setup
app.use(
  cors({
    origin: [
      "https://node129.cs.colman.ac.il",
      "https://accounts.google.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Serve static files from /uploads with proper CORS and Cross-Origin-Resource-Policy header
app.use("/uploads", (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site'); // Add the header
  next();
}, express.static(path.join(__dirname, "..", "uploads")));
console.log("serving files from "+path.join(__dirname, "..", "uploads"))
// ✅ Multer Configuration (For File Uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
export const upload = multer({ storage });
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VisionGoal API",
      version: "1.0.0",
      description: "REST API for VisionGoal app with authentication using JWT",
    },
    servers: [
      { url: "https://node129.cs.colman.ac.il" }, // או localhost אם בסביבה מקומית
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // איפה הראוטים שלך מתועדים
};

const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
const frontendDir = path.resolve(__dirname, "..", "../Backend/front"); // Adjust to actual build folder

app.use(express.static(frontendDir)); 

app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

const server = http.createServer(app); 

export const initApp = () => {
  return new Promise<{app : Express , server : http.Server}>((resolve, reject) => {
    if (!process.env.MONGO_URI) {
      reject("MONGODB_URI is not defined in .env file");
    } else {
      mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
          resolve({app,server});
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

// ✅ Connect to MongoDB before starting the app
export default connectDB().then(() => app);
