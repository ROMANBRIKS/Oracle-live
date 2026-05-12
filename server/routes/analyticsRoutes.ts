import express from "express";
import { saveAnalytics, getCreatorAnalytics, startStreamAnalytics, updateStreamAnalytics } from "../controllers/analyticsController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

// Legacy
router.post("/save", saveAnalytics);

// New Analytics
router.post("/start", startStreamAnalytics);
router.post("/update/:id", updateStreamAnalytics);
router.get("/streamer/:streamerId", getCreatorAnalytics);

// PHASE 6.3 - Unified GET analytics for dashboard
router.get("/stream/:streamerId", getCreatorAnalytics);

export default router;
