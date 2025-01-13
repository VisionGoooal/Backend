import { Request, Response } from "express";
import { Model } from "mongoose";
import commentsModel from "../models/commentModel";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  getAll = async (req: Request, res: Response) => {
    const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const data = await this.model.find({ owner: ownerFilter });

        res.status(200).send(data);
      } else {
        const data = await this.model.find();
        res.status(200).send(data);
      }
    } catch (error) {
      res.status(400).send(error);
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
      const data = await this.model.findById(dataId);
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
      const item = await this.model.findByIdAndUpdate(itemId, req.body, {
        new: true,
      });
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
