"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const http = __importStar(require("http"));
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
    origin: [
        "https://node129.cs.colman.ac.il",
        "https://accounts.google.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
const server = http.createServer(app);
const initApp = () => {
    return new Promise((resolve, reject) => {
        if (!process.env.MONGO_URI) {
            reject("MONGODB_URI is not defined in .env file");
        }
        else {
            mongoose_1.default
                .connect(process.env.MONGO_URI)
                .then(() => {
                resolve({ app, server });
            })
                .catch((error) => {
                reject(error);
            });
        }
    });
};
exports.initApp = initApp;
// ✅ Connect to MongoDB before starting the app
exports.default = (0, db_1.default)().then(() => app);
