import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import PDFParser from "pdf2json";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getIO } from "../socket.js";

dotenv.config();

const prisma = new PrismaClient();

interface PDFProcessedData {
    fileName: string;
    timestamp: string;
    extractedText: string;
    fileSize: number;
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
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
        const pdfBuffer = await fs.readFile(filePath);
        pdfParser.parseBuffer(pdfBuffer);

        const pdfData = await pdfParsingPromise;
        const extractedText = (pdfData as any).Pages?.map((page: any) =>
            page.Texts?.map((text: any) => decodeURIComponent(text.R?.[0]?.T || "")).join(" ")
        ).join("\n");

        // Save document in the database
        const document = await prisma.document.create({
            data: {
                filename: uploadedFile.originalname,
                content: extractedText,
                QAs: [] // Initialize empty QAs array
            },
        });

        const processedData: PDFProcessedData = {
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

    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({
            error: "Failed to process PDF file",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};