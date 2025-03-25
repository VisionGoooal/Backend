import express from "express";
import passport from "passport";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import * as authController from "../controllers/authController";

const router = express.Router();

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

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

// Profile
router.get("/profile/:userId", protect, authController.getProfile);
router.put("/update-profile/:userId", protect, authController.updateProfile);
router.post(
  "/upload-profile-image/:userId",
  protect,
  upload.single("profileImage"),
  authController.uploadProfileImage
);

router.post('/googleAuth', authController.googleSignIn);

router.get("/all-users", protect, authController.getAllUsers);


export = router;