"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getProfile = exports.uploadProfileImage = exports.updateProfile = exports.googleAuthCallback = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// @ts-ignore
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Generate Access Token
 */
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || "default_secret", // Ensures a fallback if JWT_SECRET is missing
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
};
/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET ||
        "default_refresh_secret", // Ensures a fallback if REFRESH_TOKEN_SECRET is missing
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};
/**
 * User Login & Token Generation
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userFullName, email, password, confirmPassword, country, dateOfBirth, } = req.body;
        // 🔹 Validate required fields
        if (!userFullName ||
            !email ||
            !password ||
            !confirmPassword ||
            !country ||
            !dateOfBirth) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        // 🔹 Password match check
        if (password !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }
        // 🔹 Check if user already exists
        const existingUser = yield userModel_1.default.findOne({ email });
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
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // 🔹 Create new user in MongoDB
        const newUser = yield userModel_1.default.create({
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
        yield newUser.save();
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
    }
    catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.register = register;
/**
 * 📌 Login User
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 🔹 Validate input
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        // 🔹 Check if user exists
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Wrong email or password" });
            return;
        }
        // 🔹 Verify password
        if (!user.password) {
            res.status(400).json({ message: "Wrong email or password" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Wrong email or password" });
            return;
        }
        // 🔹 Generate tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        // 🔹 Save refresh token in database
        user.refreshToken = [refreshToken];
        yield user.save();
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
    }
    catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.login = login;
/**
 * 📌 Refresh Access Token
 */
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        // Verify the refresh token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded.id) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        // Find user in DB
        const user = yield userModel_1.default.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Generate a new access token
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ accessToken: newAccessToken });
    }
    catch (error) {
        console.error("❌ Error refreshing token:", error);
        next(error); // ✅ Properly forward errors to Express error handler
    }
});
exports.refreshToken = refreshToken;
/**
 * 📌 Logout User (Invalidate Refresh Token)
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: "Refresh token required" });
            return;
        }
        // 🔹 Find user and remove refresh token
        const user = yield userModel_1.default.findOneAndUpdate({ refreshToken: token }, { refreshToken: [] });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("❌ Error in logout:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.logout = logout;
const googleAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const googleUser = req.user;
        console.log("🔍 Google User Data:", googleUser);
        if (!googleUser || !googleUser.email) {
            res.status(400).json({ message: "Google login failed" });
            return;
        }
        let user = yield userModel_1.default.findOne({ email: googleUser.email });
        if (!user) {
            const safeUserName = googleUser.displayName ||
                googleUser.email.split("@")[0] ||
                "GoogleUser";
            user = new userModel_1.default({
                userFullName: safeUserName,
                email: googleUser.email,
                profileImage: googleUser.picture ||
                    "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1742145365~exp=1742148965~hmac=bd302071cdce6ac960ce3e2f8fee275629adf2d0ffcd7e26625d0175a2daf20a&w=740", // fallback image
                refreshToken: [],
                country: "Unknown",
                dateOfBirth: new Date("2000-01-01"),
            });
            yield user.save();
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret", {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
        });
        user.refreshToken = [refreshToken];
        yield user.save();
        res.redirect(`http://localhost:5173/feed?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
    catch (error) {
        console.error("❌ Error in Google Auth Callback:", error);
        res.status(500).json({ message: "Google authentication failed" });
    }
});
exports.googleAuthCallback = googleAuthCallback;
/**
 * 📌 Update User Profile
 */
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userFullName, country, dateOfBirth } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield userModel_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // ✅ Update allowed fields only
        if (userFullName)
            user.userFullName = userFullName;
        if (country)
            user.country = country;
        if (dateOfBirth)
            user.dateOfBirth = new Date(dateOfBirth);
        // ❌ Disallow email/password updates
        // (Ignore req.body.email and req.body.password)
        yield user.save();
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
    }
    catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateProfile = updateProfile;
const uploadProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        // Construct relative path (e.g., /uploads/filename.jpg)
        const filePath = `/uploads/${req.file.filename}`;
        // Find user by token-based ID (middleware puts it on req.user)
        const user = yield userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Save file path to MongoDB
        user.profileImage = filePath;
        yield user.save(); // 🔥 Saves the new profile image path in the DB
        // Optionally construct full URL to send to frontend
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const fullUrl = `${baseUrl}${filePath}`;
        res.json({
            message: "Profile image updated successfully",
            profileImage: fullUrl,
        });
    }
    catch (error) {
        console.error("❌ Error uploading profile image:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.uploadProfileImage = uploadProfileImage;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield userModel_1.default.findById(req.user.id).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getProfile = getProfile;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const users = yield userModel_1.default.find({ _id: { $ne: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id } }).select("userFullName profileImage");
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});
exports.getAllUsers = getAllUsers;
