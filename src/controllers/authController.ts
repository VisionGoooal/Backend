/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request, NextFunction } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import path from "path";

/**
 * 📌 Generate JWT Tokens (Access & Refresh)
 */
const generateTokens = (
  id: string
): { accessToken: string; refreshToken: string } | null => {
  const random = Math.floor(Math.random() * 1000000);
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    return null;
  }
  const accessToken = jwt.sign({ _id: id, random }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
  const refreshToken = jwt.sign(
    { _id: id, random },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
  return { accessToken, refreshToken };
};

/**
 * 📌 Register New User
 */
const register = async (req: Request, res: Response) => {
  try {
    const { userFullName, email, password, country, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in MongoDB
    const newUser = await userModel.create({
      userFullName, // ✅ Correct field name
      email,
      password: hashedPassword,
      country: country || "Unknown", // Default if not provided
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("2000-01-01"), // Default if not provided
    });

    // Generate JWT tokens
    const tokens = generateTokens(newUser._id.toString());
    if (!tokens) {
      res.status(500).json({ message: "Server error" });
      return;
    }

    // Save refresh token
    newUser.refreshToken = [tokens.refreshToken];
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser._id,
        userFullName: newUser.userFullName,
        email: newUser.email,
        country: newUser.country,
        dateOfBirth: newUser.dateOfBirth,
      },
    });
  } catch (error) {
    console.error("❌ Error in register:", error);

    res.status(500).json({
      message: "Server error!",
      error: (error as Error).message,
    });
  }
};

/**
 * 📌 Login User
 */
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const validPassword = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!validPassword) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const tokens = generateTokens(user._id);
    if (!tokens) {
      res.status(500).json({ message: "Server error" });
      return;
    }

    if (user.refreshToken) {
      user.refreshToken.push(tokens.refreshToken);
    } else {
      user.refreshToken = [tokens.refreshToken];
    }
    await user.save();

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Logout User (Invalidate Refresh Token)
 */
const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Bad request" });
    return;
  }

  try {
    const user = await userModel.findOne({ refreshToken });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.refreshToken) {
      user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
    }
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Refresh Access Token
 */
const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Bad request" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    const user = await userModel.findById(decoded._id);
    if (
      !user ||
      !user.refreshToken ||
      !user.refreshToken.includes(refreshToken)
    ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const newTokens = generateTokens(user._id);
    if (!newTokens) {
      res.status(500).json({ message: "Server error" });
      return;
    }

    user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
    user.refreshToken.push(newTokens.refreshToken);
    await user.save();

    res.status(200).json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Google Authentication Callback
 */
const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleUser = req.user as any; // Google OAuth user object

    console.log("🔍 Google User Data:", googleUser); // ✅ Add this for debugging

    if (!googleUser || !googleUser.email) {
      res.status(400).json({ message: "Google login failed" });
      return;
    }

    let user = await userModel.findOne({ email: googleUser.email });

    if (!user) {
      // 🔹 Ensure `userFullName` exists (fallback to email username)
      const safeUserName = googleUser.displayName || googleUser.email.split("@")[0] || "GoogleUser";

      console.log("✅ Setting userFullName as:", safeUserName); // ✅ Debugging

      user = new userModel({
        userFullName: safeUserName, // ✅ Ensure it's never empty
        email: googleUser.email,
        profileImage: googleUser.picture || "", // Store profile picture
        refreshToken: [], // Initialize empty array for refresh tokens
        country: "Unknown",
        dateOfBirth: new Date("2000-01-01"), // Default date if missing
      });

      await user.save();
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString());
    if (!tokens) {
      res.status(500).json({ message: "Server error" });
      return;
    }

    user.refreshToken = [tokens.refreshToken];
    await user.save();

    res.redirect(
      `http://localhost:5173/feed?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  } catch (error) {
    console.error("❌ Google Authentication Failed:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};


/**
 * 📌 Get User Profile
 */
const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await userModel
      .findById(req.params.userId)
      .select("-password -refreshToken");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Update User Profile
 */
const updateProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (username) user.userFullName = username;
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Upload Profile Image
 */
const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const filePath = `/uploads/${req.file.filename}`;
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.profileImage = filePath;
    await user.save();

    res.json({ message: "Profile image updated", profileImage: filePath });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  register,
  login,
  logout,
  refresh,
  googleAuthCallback,
  getProfile,
  updateProfile,
  uploadProfileImage,
};
