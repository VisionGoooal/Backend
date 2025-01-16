import postModel, { IPost } from "../models/postModel";
import base_controller from "./base_controller";

const BaseController = new base_controller<IPost>(postModel);

export const likePost = async (req: any, res: any) => {
    const { id } = req.params;

    try {
      // Fetch the post by ID
      const post = await postModel.findById(id);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Increment the likes count
      post.likes += 1;
      await post.save();
  
      // Respond with the updated likes count
      res.status(200).json({ likes: post.likes });
    } catch (error) {
      console.error("Error liking the post:", error);
      res.status(500).json({ message: "An error occurred while liking the post" });
    }
};

export default BaseController;
