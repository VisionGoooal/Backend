import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

export = router;