import CommentModel, { IComment } from "../models/commentModel";
import base_controller from "./baseController";

const BaseController = new base_controller<IComment>(CommentModel);

export const getCommentsByPostId = async (req: any, res: any) => {
  const postId = req.params.postId;
  try {
    const comments = await CommentModel.find({ postId });
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

export default BaseController;
