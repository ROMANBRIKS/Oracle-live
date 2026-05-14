import db from "../config/db";

export class StreamAnalyticsInstance {
  id: string;
  streamerId: string;
  roomId: string;
  totalViewers: number;
  peakViewers: number;
  totalGifts: number;
  totalCoins: number;
  watchTime: number;
  newFollowers: number;
  likes: number;
  shares: number;
  streamDuration: number;
  averageWatchTime: number;
  engagementScore: number;
  giftScore: number;
  retentionRate: number;
  aiViralScore: number;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: any) {
    this.id = data.id;
    this.streamerId = data.streamerId || data.streamer_id || data.creatorId || data.creator_id;
    this.roomId = data.roomId || data.room_id || data.streamId || data.stream_id;
    this.totalViewers = data.totalViewers !== undefined ? data.totalViewers : (data.total_viewers ?? 0);
    this.peakViewers = data.peakViewers !== undefined ? data.peakViewers : (data.peak_viewers ?? 0);
    this.totalGifts = data.totalGifts !== undefined ? data.totalGifts : (data.total_gifts ?? 0);
    this.totalCoins = data.totalCoins !== undefined ? data.totalCoins : (data.total_coins ?? 0);
    this.watchTime = data.watchTime !== undefined ? data.watchTime : (data.watch_time ?? 0);
    this.newFollowers = data.newFollowers !== undefined ? data.newFollowers : (data.new_followers ?? 0);
    this.likes = data.likes !== undefined ? data.likes : 0;
    this.shares = data.shares !== undefined ? data.shares : 0;
    this.streamDuration = data.streamDuration !== undefined ? data.streamDuration : (data.stream_duration ?? 0);
    this.averageWatchTime = data.averageWatchTime !== undefined ? data.averageWatchTime : (data.average_watch_time ?? 0.0);
    this.engagementScore = data.engagementScore !== undefined ? data.engagementScore : (data.engagement_score ?? 0.0);
    this.giftScore = data.giftScore !== undefined ? data.giftScore : (data.gift_score ?? 0.0);
    this.retentionRate = data.retentionRate !== undefined ? data.retentionRate : (data.retention_rate ?? 0.0);
    this.aiViralScore = data.aiViralScore !== undefined ? data.aiViralScore : (data.ai_viral_score ?? 0.0);
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  async save(): Promise<StreamAnalyticsInstance> {
    const exists = db.prepare("SELECT 1 FROM stream_analytics WHERE id = ?").get(this.id);
    if (exists) {
      db.prepare(`
        UPDATE stream_analytics 
        SET streamer_id = ?, room_id = ?, total_viewers = ?, peak_viewers = ?, total_gifts = ?,
            total_coins = ?, watch_time = ?, new_followers = ?, likes = ?, shares = ?,
            stream_duration = ?, average_watch_time = ?, engagement_score = ?, gift_score = ?,
            retention_rate = ?, ai_viral_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        this.streamerId,
        this.roomId,
        this.totalViewers,
        this.peakViewers,
        this.totalGifts,
        this.totalCoins,
        this.watchTime,
        this.newFollowers,
        this.likes,
        this.shares,
        this.streamDuration,
        this.averageWatchTime,
        this.engagementScore,
        this.giftScore,
        this.retentionRate,
        this.aiViralScore,
        this.id
      );
    } else {
      db.prepare(`
        INSERT INTO stream_analytics (id, streamer_id, room_id, total_viewers, peak_viewers, total_gifts,
                                     total_coins, watch_time, new_followers, likes, shares,
                                     stream_duration, average_watch_time, engagement_score, gift_score,
                                     retention_rate, ai_viral_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        this.id,
        this.streamerId,
        this.roomId,
        this.totalViewers,
        this.peakViewers,
        this.totalGifts,
        this.totalCoins,
        this.watchTime,
        this.newFollowers,
        this.likes,
        this.shares,
        this.streamDuration,
        this.averageWatchTime,
        this.engagementScore,
        this.giftScore,
        this.retentionRate,
        this.aiViralScore
      );
    }
    return this;
  }
}

export const StreamAnalytics = {
  create: async (data: any): Promise<StreamAnalyticsInstance> => {
    const analytics = new StreamAnalyticsInstance(data);
    await analytics.save();
    return analytics;
  },

  find: async (filter: any = {}): Promise<StreamAnalyticsInstance[]> => {
    let query = "SELECT * FROM stream_analytics";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.streamerId !== undefined || filter.streamer_id !== undefined || filter.creatorId !== undefined || filter.creator_id !== undefined) {
      conditions.push("streamer_id = ?");
      params.push(filter.streamerId || filter.streamer_id || filter.creatorId || filter.creator_id);
    }
    if (filter.roomId !== undefined || filter.room_id !== undefined || filter.streamId !== undefined || filter.stream_id !== undefined) {
      conditions.push("room_id = ?");
      params.push(filter.roomId || filter.room_id || filter.streamId || filter.stream_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => new StreamAnalyticsInstance(row));
  },

  findOne: async (filter: any = {}): Promise<StreamAnalyticsInstance | null> => {
    let query = "SELECT * FROM stream_analytics";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.streamerId !== undefined || filter.streamer_id !== undefined || filter.creatorId !== undefined || filter.creator_id !== undefined) {
      conditions.push("streamer_id = ?");
      params.push(filter.streamerId || filter.streamer_id || filter.creatorId || filter.creator_id);
    }
    if (filter.roomId !== undefined || filter.room_id !== undefined || filter.streamId !== undefined || filter.stream_id !== undefined) {
      conditions.push("room_id = ?");
      params.push(filter.roomId || filter.room_id || filter.streamId || filter.stream_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT 1";

    const row = db.prepare(query).get(...params) as any;
    return row ? new StreamAnalyticsInstance(row) : null;
  },

  findById: async (id: string): Promise<StreamAnalyticsInstance | null> => {
    const row = db.prepare("SELECT * FROM stream_analytics WHERE id = ?").get(id) as any;
    return row ? new StreamAnalyticsInstance(row) : null;
  }
};

export default StreamAnalytics;
