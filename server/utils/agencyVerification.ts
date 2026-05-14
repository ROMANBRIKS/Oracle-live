import db from "../config/db";

export async function verifyAgency(agencyId: string) {
  const agency = db.prepare("SELECT * FROM agencies WHERE id = ?").get(agencyId) as any;

  if (!agency) return null;

  db.prepare("UPDATE agencies SET verified = 1 WHERE id = ?").run(agencyId);

  return db.prepare("SELECT * FROM agencies WHERE id = ?").get(agencyId);
}
