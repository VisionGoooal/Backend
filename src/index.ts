import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import cors from "cors";
import postsRoutes from "./routes/postRoutes";
import commentsRoutes from "./routes/commentRoutes";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import { Server } from "socket.io";
import { chatSocket } from "./socket/chatSocket";


const app: Express = express();
const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log("Connected to the MongoDB database successfully.");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
    });

app.use(cors({ origin: "http://localhost:5173" })); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/post", postsRoutes);
app.use("/comment", commentsRoutes);
app.use("/auth", authRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
    },
});

chatSocket(io);
