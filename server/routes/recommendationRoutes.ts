import express from "express";
import { getRecommendedStreams } from "../utils/recommendationEngine";

const router = express.Router();

router.get("/for-you", async (req, res) => {
  try {
    const streams = await getRecommendedStreams();
    res.json(streams);
  } catch (err: any) {
    console.error("Recommendation fetch error:", err);
    res.status(500).json({ message: "Failed to load For You recommendations" });
  }
});

export default router;
