import express from "express";
import { saveAnalytics, getCreatorAnalytics } from "../controllers/analyticsController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.post("/save", saveAnalytics);
router.get("/:streamerId", getCreatorAnalytics);

export default router;
