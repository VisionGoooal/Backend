"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const commentModel_1 = __importDefault(require("../models/commentModel"));
class BaseController {
    likePost(arg0, likePost) {
        throw new Error("Method not implemented.");
    }
    constructor(model) {
        this.getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract and properly format ownerFilter
                const ownerFilter = req.query.owner;
                let filter = {};
                if (ownerFilter) {
                    if (Array.isArray(ownerFilter)) {
                        filter = { owner: { $in: ownerFilter.map(String) } }; // Handle array of owners
                    }
                    else {
                        filter = { owner: String(ownerFilter) }; // Ensure owner is a string
                    }
                }
                // Fetch data with or without the filter
                const data = yield this.model.find(filter).populate("owner");
                ;
                res.status(200).json(data);
            }
            catch (error) {
                console.error("Error fetching data:", error);
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });
        this.createItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            try {
                const newItem = yield this.model.create(data);
                res.status(201).send(newItem);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
        this.getDataById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const dataId = req.params.id;
            try {
                const data = yield this.model.findById(dataId).populate("owner");
                if (!data) {
                    console.log("data not found");
                    res.status(404).send("data not found");
                    return;
                }
                res.status(200).send(data);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
        this.updateItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const itemId = req.params.id;
            try {
                if (req.file) {
                    const filePath = `/uploads/${req.file.filename}`;
                    const baseUrl = process.env.BASE_URL || "https://node129.cs.colman.ac.il";
                    const fullUrl = `${baseUrl}${filePath}`;
                    const updatedItem = yield this.model.findByIdAndUpdate(itemId, { image: fullUrl }, // Only update the image field
                    { new: true } // Return the updated document
                    );
                }
                const item = yield this.model.findByIdAndUpdate(itemId, req.body, {
                    new: true,
                });
                // Check if it's a Post model and populate
                if (this.model.modelName === "Post" && item) {
                    yield item.populate([
                        { path: "owner" }
                    ]);
                }
                res.status(200).send(item);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
        this.deleteItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const itemId = req.params.id;
            try {
                const item = yield this.model.findByIdAndDelete(itemId);
                if (!item) {
                    res.status(404).send({ message: "Item not found" });
                    return;
                }
                if (this.model.modelName === "Post") {
                    yield commentModel_1.default.deleteMany({ postId: itemId });
                }
                res.status(200).send(item);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
        this.model = model;
    }
}
module.exports = BaseController;
