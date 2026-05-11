import express from "express";
import { trackView, getRecommendations, getLeaderboard, getFeed } from "../controllers/recController";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/track", auth, trackView);
router.get("/suggest/:userId", auth, getRecommendations);
router.get("/leaderboard", getLeaderboard);
router.get("/feed", getFeed);

export default router;
