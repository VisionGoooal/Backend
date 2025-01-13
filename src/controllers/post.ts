import postModel,{IPost} from "../models/postModel";
import base_controller from "./base_controller";

const BaseController = new base_controller<IPost>(postModel);

export default BaseController;