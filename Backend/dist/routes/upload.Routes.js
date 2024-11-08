import express from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { upload } from "../middleware/fileHandler.middleware.js";
const router = express.Router();
router.post("/upload", upload.single("pdf"), uploadFile);
export default router;
