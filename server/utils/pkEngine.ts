import db from "../config/db";

export async function updateBattleScore(battleId: string, host: string, points: number) {
  try {
    const battle = db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(battleId) as any;

    if (!battle) {
      return null;
    }

    if (battle.host_a === host) {
      db.prepare("UPDATE pk_battles SET score_a = score_a + ? WHERE id = ?").run(points, battleId);
    } else if (battle.host_b === host) {
      db.prepare("UPDATE pk_battles SET score_b = score_b + ? WHERE id = ?").run(points, battleId);
    }

    return db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(battleId);
  } catch (err) {
    console.error("Error updating battle score:", err);
    return null;
  }
}

export async function endBattle(battleId: string) {
  try {
    const battle = db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(battleId) as any;

    if (!battle) {
      return null;
    }

    const winner = battle.score_a > battle.score_b ? battle.host_a : (battle.score_b > battle.score_a ? battle.host_b : 'draw');

    db.prepare(`
      UPDATE pk_battles 
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP, winner = ?
      WHERE id = ?
    `).run(winner, battleId);

    return db.prepare("SELECT * FROM pk_battles WHERE id = ?").get(battleId);
  } catch (err) {
    console.error("Error ending battle:", err);
    return null;
  }
}
