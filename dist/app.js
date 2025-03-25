"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Import Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const predictionRoutes_1 = __importDefault(require("./routes/predictionRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ✅ Ensure "uploads" directory exists
const uploadDir = path_1.default.join(__dirname, "..", "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ✅ Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ CORS setup
app.use((0, cors_1.default)({
    origin: "https://node129.cs.colman.ac.il",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "https://restcountries.com",
                "https://accounts.google.com",
                "https://oauth2.googleapis.com"
            ],
            imgSrc: ["'self'", "blob:", "data:", "*"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://accounts.google.com",
                "https://apis.google.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://accounts.google.com"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'self'", "https://accounts.google.com"],
        },
    },
}));
// ✅ Serve static files from /uploads with proper CORS and Cross-Origin-Resource-Policy header
app.use("/uploads", (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site'); // Add the header
    next();
}, express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
console.log("serving files from " + path_1.default.join(__dirname, "..", "uploads"));
// ✅ Multer Configuration (For File Uploads)
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname)),
});
exports.upload = (0, multer_1.default)({ storage });
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
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// ✅ Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/prediction", predictionRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use("/api/comments", commentRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
const frontendDir = path_1.default.resolve(__dirname, "..", "../Backend/front"); // Adjust to actual build folder
app.use(express_1.default.static(frontendDir));
app.get("/*", (req, res) => {
    res.sendFile(path_1.default.join(frontendDir, "index.html"));
});
// ✅ Connect to MongoDB before starting the app
exports.default = (0, db_1.default)().then(() => app);
