import { io } from "socket.io-client";

// In AI Studio, we don't always have VITE_API_URL set, so we can default to empty string (current origin)
const socket = io(import.meta.env.VITE_API_URL || "");

export default socket;
