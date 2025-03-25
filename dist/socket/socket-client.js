"use strict";
// import io from "socket.io-client"; 
// interface MessageData {
//     roomId: string;
//     message: string;
// }
// const client1 = io("http://localhost:3000");
// client1.emit("joinRoom", "room1"); 
// client1.on("receiveMessage", (data: { senderId: string, message: string }) => {
//     console.log("Client 1 received message:", data.message);
// });
// const client2 = io("http://localhost:3000");
// client2.emit("joinRoom", "room1"); // 
// client2.on("receiveMessage", (data: { senderId: string, message: string }) => {
//     console.log("Client 2 received message:", data.message);
// });
// setTimeout(() => {
//     const message: MessageData = { roomId: "room1", message: "Hello from Client 1!" };
//     client1.emit("sendMessage", message);
// }, 1000);
// setTimeout(() => {
//     const message: MessageData = { roomId: "room1", message: "Hello from Client 2!" };
//     client2.emit("sendMessage", message);
// }, 3000);
