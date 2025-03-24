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
exports.createPost = exports.likePost = void 0;
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
        post.likes += 1;
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
    const { title, content, owner } = req.body;
    let imageUrl = null;
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }
    const newPost = new postModel_1.default({
        title,
        content,
        owner,
        image: imageUrl,
    });
    try {
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error("Error saving post:", error);
        res.status(500).json({ message: "Error saving post" });
    }
});
exports.createPost = createPost;
exports.default = BaseController;
