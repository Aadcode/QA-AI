var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs-extra";
import path from "path";
import PDFParser from "pdf2json";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getIO } from "../socket.js";
dotenv.config();
const prisma = new PrismaClient();
export const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const uploadedFile = req.file;
    if (!uploadedFile) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    try {
        const pdfParser = new PDFParser();
        const pdfParsingPromise = new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataReady", resolve);
            pdfParser.on("pdfParser_dataError", reject);
        });
        const filePath = path.join("./public/files", uploadedFile.originalname);
        const pdfBuffer = yield fs.readFile(filePath);
        pdfParser.parseBuffer(pdfBuffer);
        const pdfData = yield pdfParsingPromise;
        const extractedText = (_a = pdfData.Pages) === null || _a === void 0 ? void 0 : _a.map((page) => { var _a; return (_a = page.Texts) === null || _a === void 0 ? void 0 : _a.map((text) => { var _a, _b; return decodeURIComponent(((_b = (_a = text.R) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.T) || ""); }).join(" "); }).join("\n");
        // Save document in the database
        const document = yield prisma.document.create({
            data: {
                filename: uploadedFile.originalname,
                content: extractedText,
                QAs: [] // Initialize empty QAs array
            },
        });
        const processedData = {
            fileName: uploadedFile.originalname,
            timestamp: new Date().toISOString(),
            extractedText,
            fileSize: uploadedFile.size,
        };
        // Emit processed data via WebSocket
        const io = getIO();
        io.emit('pdfProcessed', processedData);
        console.log('PDF data emitted via WebSocket');
        res.status(200).json({
            message: "File uploaded and processed successfully",
            file: {
                originalName: uploadedFile.originalname,
                mimeType: uploadedFile.mimetype,
                size: uploadedFile.size,
            },
            extractedText,
        });
    }
    catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({
            error: "Failed to process PDF file",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
