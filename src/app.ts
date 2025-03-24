import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import "./config/passport"; // Google authentication
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

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
    origin: "0.0.0.0", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow sending cookies & auth headers
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allowed headers
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://restcountries.com"], // ✅ Allow API requests
        imgSrc: ["'self'", "data:", "https://www.svgrepo.com"], // ✅ Allow external images
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // ✅ Allow inline scripts
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // ✅ Allow external styles
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // ✅ Allow external fonts
      },
    },
  })
);

// app.use(morgan("dev"));
app.use(passport.initialize());

// ✅ Serve static files from /uploads with proper CORS and Cross-Origin-Resource-Policy header
app.use("/uploads", (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site'); // Add the header
  next();
}, express.static(path.join(__dirname, "..", "uploads")));

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
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "https://10.10.246.129", },{url : process.env.DOMAIN_URL}],
  },
  apis: ["./src/routes/*.ts"],
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

// ✅ Connect to MongoDB before starting the app
export default connectDB().then(() => app);
