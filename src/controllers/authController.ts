import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
// @ts-ignore
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import { OAuth2Client } from 'google-auth-library';
import env from 'dotenv';
env.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate Access Token
 */
const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    (process.env.JWT_SECRET as jwt.Secret) || "default_secret", // Ensures a fallback if JWT_SECRET is missing
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as jwt.SignOptions
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    (process.env.REFRESH_TOKEN_SECRET as jwt.Secret) ||
      "default_refresh_secret", // Ensures a fallback if REFRESH_TOKEN_SECRET is missing
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    } as jwt.SignOptions
  );
};

/**
 * User Login & Token Generation
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userFullName,
      email,
      password,
      confirmPassword,
      country,
      dateOfBirth,
    } = req.body;

    // 🔹 Validate required fields
    if (
      !userFullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !country ||
      !dateOfBirth
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // 🔹 Password match check
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (dob >= today) {
      res.status(400).json({ message: "Invalid date of birth" });
      return;
    }

    // 🔹 Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create new user in MongoDB
    const newUser = await User.create({
      userFullName,
      email,
      password: hashedPassword,
      country,
      dateOfBirth,
    });

    // 🔹 Generate JWT tokens
    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    // 🔹 Save refresh token
    newUser.refreshToken = [refreshToken];
    await newUser.save();

    // 🔹 Respond with user data & tokens
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.userFullName,
        email: newUser.email,
        country: newUser.country,
        dateOfBirth: newUser.dateOfBirth,
      },
    });
  } catch (error) {
    console.error("❌ Error in register:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Login User
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 🔹 Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // 🔹 Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Wrong email or password" });
      return;
    }

    // 🔹 Verify password
    if (!user.password) {
      res.status(400).json({ message: "Wrong email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Wrong email or password" });
      return;
    }

    // 🔹 Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // 🔹 Save refresh token in database
    user.refreshToken = [refreshToken];
    await user.save();

    // 🔹 Respond with user data and tokens
    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        userFullName: user.userFullName,
        email: user.email,
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Refresh Access Token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Verify the refresh token
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!decoded.id) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Find user in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    next(error); // ✅ Properly forward errors to Express error handler
  }
};

/**
 * 📌 Logout User (Invalidate Refresh Token)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    // 🔹 Find user and remove refresh token
    const user = await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: [] }
    );
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Error in logout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleSignIn = async (req: Request, res: Response):Promise<any> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }
    const { email, picture, name } = payload;
    // Check if user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register new user
      user = await User.create({
        email,
        profileImage: picture,
        userFullName: name, 
        password: 'google-signin', 
      });
      
    }
    // Generate JWT token
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = [refreshToken];
    await user.save();


    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        userFullName: user.userFullName, // ✅ עקבי
        profileImage: user.profileImage,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Google sign-in error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// export const googleAuthCallback = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const googleUser = req.user as any;

//     console.log("🔍 Google User Data:", googleUser);

//     if (!googleUser || !googleUser.email) {
//       res.status(400).json({ message: "Google login failed" });
//       return;
//     }

//     let user = await User.findOne({ email: googleUser.email });

//     if (!user) {
//       const safeUserName =
//         googleUser.displayName ||
//         googleUser.email.split("@")[0] ||
//         "GoogleUser";

//       user = new User({
//         userFullName: safeUserName,
//         email: googleUser.email,
//         profileImage:
//           googleUser.picture ||
//           "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1742145365~exp=1742148965~hmac=bd302071cdce6ac960ce3e2f8fee275629adf2d0ffcd7e26625d0175a2daf20a&w=740", // fallback image
//         refreshToken: [],
//         country: "Unknown",
//         dateOfBirth: new Date("2000-01-01"),
//       });

//       await user.save();
//     }

//     const accessToken = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET || "default_secret",
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN || "1h",
//       } as jwt.SignOptions
//     );

//     const refreshToken = jwt.sign(
//       { id: user._id },
//       process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
//       {
//         expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
//       } as jwt.SignOptions
//     );

//     user.refreshToken = [refreshToken];
//     await user.save();

//     res.redirect(
//       `http://localhost:5173/feed?accessToken=${accessToken}&refreshToken=${refreshToken}`
//     );
//   } catch (error) {
//     console.error("❌ Error in Google Auth Callback:", error);
//     res.status(500).json({ message: "Google authentication failed" });
//   }
// };

/**
 * 📌 Update User Profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userFullName, country, dateOfBirth } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById((req.user as any)._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Update allowed fields only
    if (userFullName) user.userFullName = userFullName;
    if (country) user.country = country;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);

    // ❌ Disallow email/password updates
    // (Ignore req.body.email and req.body.password)

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        userFullName: user.userFullName,
        email: user.email, // Read-only
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Construct relative path (e.g., /uploads/filename.jpg)
    const filePath = `/uploads/${req.file.filename}`;

    // Find user by token-based ID (middleware puts it on req.user)
    const user = await User.findById((req.user as any)?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Save file path to MongoDB
    user.profileImage = filePath;
    await user.save(); // 🔥 Saves the new profile image path in the DB

    // Optionally construct full URL to send to frontend
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const fullUrl = `${baseUrl}${filePath}`;

    res.json({
      message: "Profile image updated successfully",
      profileImage: fullUrl,
    });
  } catch (error) {
    console.error("❌ Error uploading profile image:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await User.findById((req.user as any).id).select(
      "-password -refreshToken"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ _id: { $ne: (req.user as any)?._id } }).select(
      "userFullName profileImage"
    );

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
