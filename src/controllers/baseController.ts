import { Request, Response } from "express";
import { Model } from "mongoose";
import commentsModel from "../models/commentModel";
import { Document } from "mongoose";


class BaseController<T> {
  likePost(arg0: string, likePost: any) {
      throw new Error("Method not implemented.");
  }
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  getAll = async (req: Request, res: Response) => {
    try {
      // Extract and properly format ownerFilter
      const ownerFilter = req.query.owner;
      let filter = {};
  
      if (ownerFilter) {
        if (Array.isArray(ownerFilter)) {
          filter = { owner: { $in: ownerFilter.map(String) } }; // Handle array of owners
        } else {
          filter = { owner: String(ownerFilter) }; // Ensure owner is a string
        }
      }
  
      // Fetch data with or without the filter
      const data = await this.model.find(filter).populate("owner");;
  
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  };
  
  createItem = async (req: Request, res: Response) => {
    const data = req.body;
    try {
      const newItem = await this.model.create(data);
      res.status(201).send(newItem);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  getDataById = async (req: Request, res: Response) => {
    const dataId = req.params.id;
    try {
      const data = await this.model.findById(dataId).populate("owner");
      
      if (!data) {
        console.log("data not found");

         res.status(404).send("data not found");
         return
      }
      res.status(200).send(data);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  updateItem = async (req: Request, res: Response) => {
    const itemId = req.params.id;
    try {
      if(req.file)
        {
          const filePath = `/uploads/${req.file.filename}`;
          const baseUrl = process.env.BASE_URL || "https://node129.cs.colman.ac.il";
          const fullUrl = `${baseUrl}${filePath}`;
          const updatedItem = await this.model.findByIdAndUpdate(
            itemId, 
            { image: fullUrl },  // Only update the image field
            { new: true }  // Return the updated document
          )
        }
      const item = await this.model.findByIdAndUpdate(itemId, req.body, {
        new: true,
      });
       // Check if it's a Post model and populate
    if (this.model.modelName === "Post" && item) {
     
      await (item as Document).populate([
    { path: "owner" }  ]);
    }
      res.status(200).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  deleteItem = async (req: Request, res: Response) => {
    const itemId = req.params.id;
    try {
      const item = await this.model.findByIdAndDelete(itemId);

      if (!item) {
         res.status(404).send({ message: "Item not found" });
         return
      }

      if (this.model.modelName === "Post") {
        await commentsModel.deleteMany({ postId: itemId });
      }

      res.status(200).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  };
}

export = BaseController;
