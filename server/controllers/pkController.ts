import { Server } from "socket.io";
import db from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { updateBattleScore as updateScoreInDb, endBattle as endBattleInDb } from "../utils/pkEngine";

export const getPKStatus = (req: any, res: any) => {
  const { battleId } = req.params;
  try {
    const battle = db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(battleId);
    if (!battle) return res.status(404).json({ error: "Battle not found" });
    res.json(battle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const startPK = (req: any, res: any, io: Server) => {
  const { hostA, hostB, roomId, duration = 300 } = req.body;
  
  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO pk_battles (id, room_id, host_a, host_b, status, duration, started_at)
      VALUES (?, ?, ?, ?, 'live', ?, CURRENT_TIMESTAMP)
    `).run(id, roomId, hostA, hostB, duration);

    const battle = db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(id);

    io.to(roomId).emit("pk_update", battle);
    
    res.json({ success: true, battle });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePKScore = async (battleId: string, hostId: string, points: number, io: Server) => {
  const battle = await updateScoreInDb(battleId, hostId, points);
  if (battle) {
    io.to((battle as any).room_id).emit("pk_update", battle);
  }
};

export const endPK = async (req: any, res: any, io: Server) => {
  const { battleId } = req.params;
  const battle = await endBattleInDb(battleId);
  if (battle) {
    io.to((battle as any).room_id).emit("pk_end", battle);
    res.json({ success: true, battle });
  } else {
    res.status(404).json({ error: "Battle not found" });
  }
};

export const processPKTick = (io: Server) => {
  // Logic to handle expiration if needed
};
