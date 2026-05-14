import db from "../config/db";
import { v4 as uuidv4 } from "uuid";

export async function joinAgency({
  agencyId,
  creatorId,
}: {
  agencyId: string;
  creatorId: string;
}) {
  const agency = db.prepare("SELECT * FROM agencies WHERE id = ?").get(agencyId) as any;

  if (!agency) return null;

  const existing = db.prepare("SELECT * FROM agency_members WHERE agency_id = ? AND creator_id = ?")
    .get(agencyId, creatorId) as any;

  if (existing) return existing;

  db.prepare("INSERT INTO agency_members (agency_id, creator_id) VALUES (?, ?)")
    .run(agencyId, creatorId);

  db.prepare("UPDATE agencies SET total_creators = total_creators + 1 WHERE id = ?")
    .run(agencyId);

  return db.prepare("SELECT * FROM agency_members WHERE agency_id = ? AND creator_id = ?")
    .get(agencyId, creatorId);
}

export async function updateAgencyRevenue({
  creatorId,
  amount,
}: {
  creatorId: string;
  amount: number;
}) {
  // Find active agency membership for this creator
  const member = db.prepare(`
    SELECT am.*, a.commission_rate 
    FROM agency_members am
    JOIN agencies a ON am.agency_id = a.id
    WHERE am.creator_id = ? AND am.contract_status = 'active'
    LIMIT 1
  `).get(creatorId) as any;

  if (!member) return;

  const commission = (amount * member.commission_rate) / 100;

  // Update member stats
  db.prepare(`
    UPDATE agency_members 
    SET revenue_generated = revenue_generated + ?,
        agency_commission_earned = agency_commission_earned + ?
    WHERE agency_id = ? AND creator_id = ?
  `).run(amount, commission, member.agency_id, creatorId);

  // Update agency total revenue
  db.prepare("UPDATE agencies SET total_revenue = total_revenue + ? WHERE id = ?")
    .run(commission, member.agency_id);
}
