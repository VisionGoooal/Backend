"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSocket = chatSocket;
function chatSocket(io) {
    io.on("connection", (socket) => {
        console.log("A user connected with ID: ", socket.id);
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId); // Join the room
            console.log(`Socket ${socket.id} joined room: ${roomId}`);
        });
        socket.on("sendMessage", (data) => {
            socket.to(data.roomId).emit("receiveMessage", {
                senderId: socket.id,
                message: data.message,
            });
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
}
