import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contactsRouter from "./contacts";
import testimonialsRouter from "./testimonials";
import commentsRouter from "./comments";
import statsRouter from "./stats";
import contentRouter from "./content";
import emailRouter from "./email";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contactsRouter);
router.use(testimonialsRouter);
router.use(commentsRouter);
router.use(statsRouter);
router.use(contentRouter);
router.use(emailRouter);

export default router;
