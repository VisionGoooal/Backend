import e from "express";
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
    console.log(post.likes , req.user.id)

    if(post.likes.includes(req.user.id)){
      post.likes.splice(post.likes.indexOf(req.user.id) ,1)
    }else{
      post.likes.push(req.user.id)

    }

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
  const { content, owner } = req.body;
  let imageUrl = null;

  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
  imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }
  console.log("Creating a post in model")
  const newPost = new postModel({
    content,
    owner,
    image: imageUrl,
  });

  try {
    await newPost.save();
    console.log(imageUrl)
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post - "+error });
  }
};

export default BaseController;
