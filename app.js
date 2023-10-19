import express from "express";
import { connectDB } from "./config/database.js";
import { APP_PORT } from "./config/index.js";
import BuyerRoutes from "./routes/BuyerRoutes.js";
import FreelancerRoutes from "./routes/FreelancerRoutes.js";
import ErrorMiddleware from "./middleware/Error.js";
import fileupload from "express-fileupload";
import { Server } from "socket.io";
import http from "http";
const app = express();
import cors from "cors";
import Message from "./model/Message.js";
import { User } from "./model/User.js";
import { notify } from "./utils/notifications.js";
import Chat from "./model/Chat.js";
connectDB();

// Use Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  fileupload({
    useTempFiles: true,
  })
);

app.use(cors());

// Import User Routes Hey
app.use("/v1", FreelancerRoutes);
app.use("/v1", BuyerRoutes);

const server = http.createServer(app);
const io = new Server(8086, {
  cors: {
    // origin: "*",
    cors: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle the 'new-message' event when a message is sent
  socket.on("newMessage", async (message) => {
    const newMessage = new Message({
      chatId: message.chatId,
      sender: message.senderId,
      text: message.text,
      receiver: message.recieverId,
      document: message.document,
    });

    const result = await newMessage.save();
    const chatRooms = await Chat.findById(message.chatId);
    const obj = {
      ...message,
      createdAt: new Date(),
    };

    chatRooms.lastMessage = obj;
    await newMessage.save();

    await chatRooms.save();
    const userId = message.recieverId;
    const user = await User.findOne({ _id: userId });

    const data = {
      status: "success",
      data: message,
    };
    notify(user.fcmToken, `New Message`, `${message.text}`);
    io.emit("receiveMessage", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.listen(APP_PORT, () => {
  console.log(`app  on port ${APP_PORT}`);
});

app.use(ErrorMiddleware);
