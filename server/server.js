import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


//create express app and http server
const app = express();
const server = http.createServer(app)

// Initialize socket.io Server
export const io = new Server(server,{
    cors:{origin: "*"}
})

//store online User
export const userSocketMap = {}; 

// Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    
    // emit online users to all  connection client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers" ,Object.keys(userSocketMap))
    })
})

// middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

// Routes setup
app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

const PORT = process.env.PORT || 5000;

// connect to mongodb
await connectDB()

server.listen(PORT, ()=> console.log("server is running on PORT:" + PORT));




