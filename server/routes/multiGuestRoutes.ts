import express from "express";
import db from "../config/db";
import { createSeats, joinSeat, getRoom } from "../utils/multiGuestEngine";

const router = express.Router();

// CREATE ROOM
router.post("/create", async (req, res) => {
  try {
    const { roomId, hostId, title, type, maxGuests } = req.body;
    
    db.prepare("INSERT INTO multi_guest_rooms (room_id, host_id, title, type, max_guests) VALUES (?, ?, ?, ?, ?)")
      .run(roomId, hostId, title, type || 'video', maxGuests || 9);

    await createSeats(roomId, maxGuests || 9);

    const room = await getRoom(roomId);
    res.json({
      success: true,
      room,
    });
  } catch (err: any) {
    console.error("Failed to create room:", err);
    res.status(500).json({
      message: "Failed to create room",
      error: err.message
    });
  }
});

// JOIN SEAT
router.post("/join-seat", async (req, res) => {
  try {
    const room = await joinSeat(req.body);

    if (!room) {
      return res.status(400).json({ message: "Seat is already occupied or locked" });
    }

    res.json({
      success: true,
      room,
    });
  } catch (err: any) {
    console.error("Failed to join seat:", err);
    res.status(500).json({
      message: "Failed to join seat",
      error: err.message
    });
  }
});

// GET ROOM
router.get("/:roomId", async (req, res) => {
  try {
    const room = await getRoom(req.params.roomId);
    if (!room) {
      // For demo purposes, if it's "sample-room", let's create it if it doesn't exist
      if (req.params.roomId === "sample-room") {
          const defaultHost = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
          const hostId = defaultHost ? defaultHost.id : "system";
          
          db.prepare("INSERT OR IGNORE INTO multi_guest_rooms (room_id, host_id, title, type, max_guests) VALUES (?, ?, ?, ?, ?)")
            .run("sample-room", hostId, "Sample Multi-Guest Room", "video", 9);
          
          await createSeats("sample-room", 9);
          const sampleRoom = await getRoom("sample-room");
          return res.json(sampleRoom);
      }
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (err: any) {
    console.error("Failed to fetch room:", err);
    res.status(500).json({
      message: "Failed to fetch room",
      error: err.message
    });
  }
});

export default router;
