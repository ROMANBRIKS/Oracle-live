import { Server } from "socket.io";
import db from "../config/db";

interface PKBattle {
  active: boolean;
  host1: string;
  host2: string;
  score1: number;
  score2: number;
  timeLeft: number;
  roomId?: string;
}

let pkBattle: PKBattle = {
  active: false,
  host1: "You",
  host2: "Rival_Master",
  score1: 0,
  score2: 0,
  timeLeft: 0,
};

export const getPKStatus = (req: any, res: any) => {
  res.json(pkBattle);
};

export const startPK = (req: any, res: any, io: Server) => {
  const { host1, host2, roomId } = req.body;
  
  pkBattle = {
    active: true,
    host1: host1 || "You",
    host2: host2 || "Rival_Master",
    score1: 0,
    score2: 0,
    timeLeft: 60, // 60 seconds battle
    roomId: roomId
  };

  io.emit("pk_update", pkBattle);
  if (roomId) {
    io.to(roomId).emit("pk_update", pkBattle);
  }
  
  res.json(pkBattle);
};

export const updatePKScore = (points: number, side: 1 | 2, io: Server) => {
  if (!pkBattle.active) return;
  
  if (side === 1) pkBattle.score1 += points;
  else pkBattle.score2 += points;
  
  io.emit("pk_update", pkBattle);
  if (pkBattle.roomId) {
    io.to(pkBattle.roomId).emit("pk_update", pkBattle);
  }
};

export const processPKTick = (io: Server) => {
  if (pkBattle.active && pkBattle.timeLeft > 0) {
    pkBattle.timeLeft--;
    io.emit("pk_update", pkBattle);
    if (pkBattle.roomId) {
      io.to(pkBattle.roomId).emit("pk_update", pkBattle);
    }
    
    if (pkBattle.timeLeft <= 0) {
      pkBattle.active = false;
      const winner = pkBattle.score1 > pkBattle.score2 ? pkBattle.host1 : pkBattle.host2;
      const result = { winner, score1: pkBattle.score1, score2: pkBattle.score2 };
      
      io.emit("pk_end", result);
      if (pkBattle.roomId) {
        io.to(pkBattle.roomId).emit("pk_end", result);
      }
    }
  }
};

export { pkBattle };
