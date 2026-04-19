import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all origins (both laptops on same WiFi)
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Track connected users
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`✅ User connected: ${socket.id} | Total: ${connectedUsers}`);

  // Broadcast updated user count to everyone
  io.emit("user_count", connectedUsers);

  // When a recipe is generated on one laptop → broadcast to ALL other laptops
  socket.on("recipe_generated", (data) => {
    console.log(`📩 Recipe received from ${socket.id}: ${data.title}`);
    // Send to ALL clients except the sender
    socket.broadcast.emit("new_recipe", data);
  });

  // When user starts typing/generating (show loading on other screen)
  socket.on("generating_start", (data) => {
    socket.broadcast.emit("peer_generating", data);
  });

  // When generation stops
  socket.on("generating_stop", () => {
    socket.broadcast.emit("peer_done");
  });

  // Chat message sync (optional - sync follow-up questions)
  socket.on("chat_message", (data) => {
    socket.broadcast.emit("peer_chat", data);
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`❌ User disconnected: ${socket.id} | Total: ${connectedUsers}`);
    io.emit("user_count", connectedUsers);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Rectify Socket Server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://<your-ip>:${PORT}`);
  console.log(`\n   Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your IP\n`);
});
