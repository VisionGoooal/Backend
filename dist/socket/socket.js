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
exports.socketHandler = void 0;
const chatMessageModel_1 = require("../models/chatMessageModel"); // 🔄 Adjusted path if needed
const mongoose_1 = __importDefault(require("mongoose"));
const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);
        // 🔹 Join room based on user ID (for private messaging)
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`👤 User ${userId} joined their room`);
        });
        // 🔹 Handle real-time message sending
        socket.on("sendMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ sender, receiver, message }) {
            try {
                if (!sender || !receiver || !message)
                    return;
                const newMessage = yield chatMessageModel_1.ChatMessage.create({
                    sender: new mongoose_1.default.Types.ObjectId(sender),
                    receiver: new mongoose_1.default.Types.ObjectId(receiver),
                    content: message, // ✅ fixed
                });
                // 🔁 Emit to both sender and receiver rooms
                io.to(receiver).emit("receiveMessage", newMessage);
                io.to(sender).emit("messageSent", newMessage);
            }
            catch (err) {
                console.error("❌ Error saving or sending message:", err);
            }
        }));
        // 🔌 Handle disconnect
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};
exports.socketHandler = socketHandler;
