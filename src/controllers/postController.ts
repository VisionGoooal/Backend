import postModel, { IPost } from "../models/postModel";
import base_controller from "./baseController";
import multer from "multer";
import path from "path";

const uploadDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const BaseController = new base_controller<IPost>(postModel);

export const likePost = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const post = await postModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.likes += 1;
    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("Error liking the post:", error);
    res
      .status(500)
      .json({ message: "An error occurred while liking the post" });
  }
};

export const createPost = async (req: any, res: any) => {
  const { title, content, owner } = req.body;
  let imageUrl = null;

  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const newPost = new postModel({
    title,
    content,
    owner,
    image: imageUrl,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post" });
  }
};

export default BaseController;
