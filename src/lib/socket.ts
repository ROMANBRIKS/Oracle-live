/// <reference types="vite/client" />
import { io } from "socket.io-client";

// In production, we don't need a URL if serving from the same host
const SOCKET_URL = import.meta.env.VITE_API_URL || "";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  auth: {
    token: localStorage.getItem("token")
  }
});
