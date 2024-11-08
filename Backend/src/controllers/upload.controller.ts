import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import Pdf from "pdf-parse"
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    const uploadedFile = req.file;

    if (!uploadedFile) {
        res.status(400).json({ error: "Please upload a file in PDF format" });
        return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
        await cleanupFile(uploadedFile.path);
        res.status(400).json({ error: "File size exceeds 10MB limit" });
        return;
    }
    console.log(uploadedFile)
    try {

        const buff = fs.readFileSync(`public/PDFs/${uploadedFile.originalname}`);
        console.log(buff)

        // Use PDF-parse to extract text from the PDF buffer
        const PDFData = await Pdf(buff)
        console.log("Extracted text:", PDFData.text);  // Log the extracted text

        const response = {
            message: "File uploaded and processed successfully",
            file: {
                originalName: uploadedFile.originalname,
                mimeType: uploadedFile.mimetype,
                size: uploadedFile.size,

            },
            // extractedText: PDFData.text,  // Include extracted text in the response
        };

        res.status(200).json(response);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error processing PDF file:", errorMessage);
        res.status(500).json({ error: "Failed to process PDF file", details: errorMessage });
    }
};

/**
 * Helper function to safely delete uploaded files
 */
async function cleanupFile(filePath: string): Promise<void> {
    try {
        const normalizedPath = path.resolve(filePath);  // Ensure absolute path for deletion
        await fs.unlink(normalizedPath);
        console.log("File cleaned up successfully:", normalizedPath);
    } catch (error) {
        console.error("Error cleaning up file:", error);
    }
}
