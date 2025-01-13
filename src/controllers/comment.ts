import  CommentModel,{ IComment } from "../models/commentModel";
import base_controller from "./base_controller";

const BaseController = new base_controller<IComment>(CommentModel);

export default BaseController;
