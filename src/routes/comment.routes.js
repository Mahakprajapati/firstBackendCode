import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleare.js";
import { postComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/post-comment").post(verifyJWT, postComment);

export default router;
