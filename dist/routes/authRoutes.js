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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController = __importStar(require("../controllers/authController"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user profile management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - userFullName
 *         - email
 *         - password
 *         - confirmPassword
 *         - country
 *         - dateOfBirth
 *       properties:
 *         userFullName:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         confirmPassword:
 *           type: string
 *           format: password
 *         country:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *       example:
 *         userFullName: "Israel Israeli"
 *         email: "israel@example.com"
 *         password: "123456"
 *         confirmPassword: "123456"
 *         country: "Israel"
 *         dateOfBirth: "2000-01-01"

 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *       example:
 *         email: "user@example.com"
 *         password: "123456"

 *     Tokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *       example:
 *         accessToken: "abc123"
 *         refreshToken: "def456"

 *     ProfileUpdate:
 *       type: object
 *       properties:
 *         userFullName:
 *           type: string
 *         country:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *       example:
 *         userFullName: "John Doe"
 *         country: "Israel"
 *         dateOfBirth: "2000-01-01"

 *     ProfileImageUpload:
 *       type: object
 *       properties:
 *         profileImage:
 *           type: string
 *           format: binary
 */
// Multer config for profile image upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
/**
 * @swagger
* /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", authController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authController.logout);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token
 */
router.post("/refresh", authController.refreshToken);
/**
 * @swagger
 * /api/auth/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/profile/:userId", authMiddleware_1.protect, authController.getProfile);
/**
 * @swagger
 * /api/auth/update-profile/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/update-profile/:userId", authMiddleware_1.protect, authController.updateProfile);
/**
 * @swagger
 * /api/auth/upload-profile-image/{userId}:
 *   post:
 *     summary: Upload profile image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProfileImageUpload'
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post("/upload-profile-image/:userId", authMiddleware_1.protect, upload.single("profileImage"), authController.uploadProfileImage);
/**
 * @swagger
 * /api/auth/googleAuth:
 *   post:
 *     summary: Google login using credential token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login success
 */
router.post('/googleAuth', authController.googleSignIn);
/**
 * @swagger
 * /api/auth/all-users:
 *   get:
 *     summary: Get all users (for chat)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/all-users", authMiddleware_1.protect, authController.getAllUsers);
module.exports = router;
