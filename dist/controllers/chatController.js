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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = void 0;
const chatMessageModel_1 = require("../models/chatMessageModel");
const mongoose_1 = __importDefault(require("mongoose"));
// 🔹 GET /api/chat/:userId - fetch messages between logged-in user and another
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    // const userId = req.user._id;
    // const otherUserId = req.params.userId;
    try {
        const messages = yield chatMessageModel_1.ChatMessage.find({
            $or: [
            // { sender: userId, receiver: otherUserId },
            // { sender: otherUserId, receiver: userId },
            ],
        }).sort({ timestamp: 1 }); // Oldest to newest
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ message: "Server error fetching messages" });
    }
});
exports.getMessages = getMessages;
// 🔹 POST /api/chat - send message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    // const sender = req.user._id;
    const { receiver, content } = req.body;
    if (!receiver || !content) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }
    try {
        const newMessage = yield chatMessageModel_1.ChatMessage.create({
            // sender: new mongoose.Types.ObjectId(sender),
            receiver: new mongoose_1.default.Types.ObjectId(receiver),
            content,
        });
        res.status(201).json(newMessage);
    }
    catch (err) {
        res.status(500).json({ message: "Server error sending message" });
    }
});
exports.sendMessage = sendMessage;
