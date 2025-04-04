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
exports.getAllPosts = exports.getPostsByUserId = exports.createPost = exports.likePost = void 0;
const postModel_1 = __importDefault(require("../models/postModel"));
const baseController_1 = __importDefault(require("./baseController"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploadDir = path_1.default.join(__dirname, "..", "..", "uploads");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
const BaseController = new baseController_1.default(postModel_1.default);
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield postModel_1.default.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.likes.includes(req.user.id)) {
            post.likes.splice(post.likes.indexOf(req.user.id), 1);
        }
        else {
            post.likes.push(req.user.id);
        }
        yield post.save();
        res.status(200).json({ likes: post.likes });
    }
    catch (error) {
        console.error("Error liking the post:", error);
        res
            .status(500)
            .json({ message: "An error occurred while liking the post" });
    }
});
exports.likePost = likePost;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { content } = req.body;
    const owner = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    let imageUrl = null;
    if (req.file) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    const newPost = new postModel_1.default({
        content,
        owner,
        image: imageUrl,
    });
    try {
        yield newPost.save();
        yield newPost.populate("owner", "_id userFullName profileImage");
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error("Error saving post:", error);
        res.status(500).json({ message: "Error saving post - " + error });
    }
});
exports.createPost = createPost;
const getPostsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const posts = yield postModel_1.default.find({ owner: userId }) // שים לב לשם השדה במודל שלך
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (error) {
        console.error("❌ Error fetching posts by user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getPostsByUserId = getPostsByUserId;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const posts = yield postModel_1.default.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('owner', '_id userFullName profileImage');
        const total = yield postModel_1.default.countDocuments();
        res.status(200).json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});
exports.getAllPosts = getAllPosts;
exports.default = BaseController;
