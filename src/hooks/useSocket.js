import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Connect to the Socket.IO server
// In dev: proxy handles it via vite.config.js
// In production: change this to your server IP e.g. "http://192.168.1.5:3001"
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [peerRecipe, setPeerRecipe] = useState(null);   // recipe from other laptop
  const [peerGenerating, setPeerGenerating] = useState(false); // other laptop is generating

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 Socket disconnected");
    });

    // How many users are online
    socket.on("user_count", (count) => {
      setUserCount(count);
    });

    // Receive recipe from another laptop
    socket.on("new_recipe", (data) => {
      console.log("📥 New recipe from peer:", data.title);
      setPeerRecipe(data);
    });

    // Other laptop started generating
    socket.on("peer_generating", (data) => {
      setPeerGenerating(true);
    });

    // Other laptop finished generating
    socket.on("peer_done", () => {
      setPeerGenerating(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Emit recipe to other laptops
  const emitRecipe = (content) => {
    if (!socketRef.current) return;
    const title = content.match(/🍽️\s*\*\*(.*?)\*\*/)?.[1] || "Recipe";
    socketRef.current.emit("recipe_generated", { title, content, timestamp: Date.now() });
  };

  // Emit generating state
  const emitGenerating = (ingredients) => {
    socketRef.current?.emit("generating_start", { ingredients });
  };

  const emitDone = () => {
    socketRef.current?.emit("generating_stop");
  };

  return {
    isConnected,
    userCount,
    peerRecipe,
    peerGenerating,
    emitRecipe,
    emitGenerating,
    emitDone,
    clearPeerRecipe: () => setPeerRecipe(null),
  };
}
