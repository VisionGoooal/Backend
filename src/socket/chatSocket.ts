export function chatSocket(io: any) {
    io.on("connection", (socket: any) => {
        console.log("A user connected with ID: ", socket.id);

        socket.on("joinRoom", (roomId: string) => {
            socket.join(roomId); // Join the room
            console.log(`Socket ${socket.id} joined room: ${roomId}`);
        });

        socket.on("sendMessage", (data: { roomId: string, message: string }) => {
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
