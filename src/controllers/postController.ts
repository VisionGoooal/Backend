import postModel, { IPost } from "../models/postModel";
import { Request, Response } from "express";
import base_controller from "./baseController";
import multer from "multer";
import path from "path";

interface GetPostsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    userId?: string;
  };
}
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
  const { content } = req.body;
  const owner = req.user?.id; 
  let imageUrl = null;

  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }

  const newPost = new postModel({
    content,
    owner,
    image: imageUrl,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post - " + error });
  }
};


export const getPostsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const posts = await postModel.find({ owner: userId }) // שים לב לשם השדה במודל שלך
      .sort({ createdAt: -1 }); 

    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts by user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllPosts = async (req: GetPostsRequest, res: Response): Promise<void> => {

  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');

    const posts = await postModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', '_id userFullName profileImage')
    const total = await postModel.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
}

export default BaseController;
