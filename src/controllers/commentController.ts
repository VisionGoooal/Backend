import CommentModel, { IComment } from "../models/commentModel";
import base_controller from "./baseController";

const BaseController = new base_controller<IComment>(CommentModel);

export const getCommentsByPostId = async (req: any, res: any) => {
  const postId = req.params.postId;
  try {
    const comments = await CommentModel.find({ postId }).populate("owner");
    res.status(200).json(comments);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(404).json({ message: "An unknown error occurred" });
    }
  }
};

export const createComment = async (req: any, res: any) => {
  const data = req.body;

  try {
    const newComment = await CommentModel.create(data);

    // Populate the 'owner' field after creation
    const populatedComment = await newComment.populate("owner");

    res.status(201).send(populatedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).send({ error: "Failed to create comment" });
  }
};

export default BaseController;
