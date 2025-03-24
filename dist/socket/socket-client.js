"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const client1 = (0, socket_io_client_1.default)("http://localhost:3000");
client1.emit("joinRoom", "room1");
client1.on("receiveMessage", (data) => {
    console.log("Client 1 received message:", data.message);
});
const client2 = (0, socket_io_client_1.default)("http://localhost:3000");
client2.emit("joinRoom", "room1"); // 
client2.on("receiveMessage", (data) => {
    console.log("Client 2 received message:", data.message);
});
setTimeout(() => {
    const message = { roomId: "room1", message: "Hello from Client 1!" };
    client1.emit("sendMessage", message);
}, 1000);
setTimeout(() => {
    const message = { roomId: "room1", message: "Hello from Client 2!" };
    client2.emit("sendMessage", message);
}, 3000);
