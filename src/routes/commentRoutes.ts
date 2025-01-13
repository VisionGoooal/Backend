import express from "express";
import BaseController from "../controllers/comment";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.get("/", BaseController.getAll);
router.post("/",authMiddleware, BaseController.createItem);
router.get("/:postId", BaseController.getAll);
router.put("/:id",authMiddleware, BaseController.updateItem);
router.delete("/:id",authMiddleware, BaseController.deleteItem);

export default router;
