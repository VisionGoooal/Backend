import express from "express";
import BaseController from "../controllers/comment";
import { authMiddleware } from "../controllers/auth_controller";
import { getCommentsByPostId } from "../controllers/comment";

const router = express.Router();

router.get("/", BaseController.getAll);
router.post("/",authMiddleware, BaseController.createItem);
router.get("/:postId", getCommentsByPostId);
router.put("/:id",authMiddleware, BaseController.updateItem);
router.delete("/:id",authMiddleware, BaseController.deleteItem);

export default router;
