import db from "../config/db";

export async function resetDaily() {
  db.prepare("UPDATE leaderboards SET daily_points = 0").run();
  console.log("Daily leaderboards reset.");
}

export async function resetWeekly() {
  db.prepare("UPDATE leaderboards SET weekly_points = 0").run();
  console.log("Weekly leaderboards reset.");
}

export async function resetMonthly() {
  db.prepare("UPDATE leaderboards SET monthly_points = 0").run();
  console.log("Monthly leaderboards reset.");
}

export async function resetSeason() {
  db.prepare("UPDATE leaderboards SET global_points = 0, badges = '[]'").run();
  console.log("Season leaderboards reset.");
}
