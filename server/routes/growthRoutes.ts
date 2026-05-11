import express from "express";
import { getSEOData, trackViralGrowth } from "../controllers/growthController";

const router = express.Router();

// Public SEO endpoint for crawlers/algorithms
router.get("/seo-meta", getSEOData);

// Viral tracking endpoint
router.post("/track-share", trackViralGrowth);

export default router;
