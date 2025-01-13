import express from "express";
import BaseController from "../controllers/post";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.get("/", BaseController.getAll);
router.post("/",authMiddleware, BaseController.createItem);
router.get("/:id", BaseController.getDataById);
router.put("/:id",authMiddleware, BaseController.updateItem);
router.delete("/:id",authMiddleware, BaseController.deleteItem);

export = router;