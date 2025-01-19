import express from "express";
import { authMiddleware } from "../controllers/auth_controller";
import postController, { createPost, likePost } from "../controllers/post";
import multer from "multer";
import path from "path";

const uploadDir = path.join(__dirname, "..", "..", "uploads"); // Adjusted to go two levels up
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", postController.getAll);

router.post("/", upload.single("image"), createPost);

router.get("/:id", postController.getDataById);

router.put("/:id", authMiddleware, postController.updateItem);

router.delete("/:id", authMiddleware, postController.deleteItem);

router.patch("/:id/like", likePost);

export = router;
