import { Router } from "express";
import { sendTestEmail } from "../controllers/email.controller.js";

const router = Router();

/**
 * @route POST /api/email/test
 * @desc Test sending a welcome email via SMTP
 * @access Public / Test
 */
router.post("/test", sendTestEmail);

export { router as emailRouter };
