import express from "express";
import passport from "passport";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import * as authController from "../controllers/authController";

const router = express.Router();

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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

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
router.get("/profile/:userId", protect, authController.getProfile);

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
router.put("/update-profile/:userId", protect, authController.updateProfile);

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
router.post(
  "/upload-profile-image/:userId",
  protect,
  upload.single("profileImage"),
  authController.uploadProfileImage
);

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
router.get("/all-users", protect, authController.getAllUsers);

export = router;
