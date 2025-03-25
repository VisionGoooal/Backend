import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await User.findById((decoded as { id: string }).id).select("-password");
    req.user = user ? user : undefined;

    if (!req.user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    next(); // ✅ Proceed to next middleware/controller
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
