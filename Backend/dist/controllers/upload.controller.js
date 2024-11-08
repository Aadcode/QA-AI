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
import Pdf from "pdf-parse";
export const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadedFile = req.file;
    if (!uploadedFile) {
        res.status(400).json({ error: "Please upload a file in PDF format" });
        return;
    }
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
        yield cleanupFile(uploadedFile.path);
        res.status(400).json({ error: "File size exceeds 10MB limit" });
        return;
    }
    console.log(uploadedFile);
    try {
        const buff = fs.readFileSync(`public/PDFs/${uploadedFile.originalname}`);
        console.log(buff);
        // Use PDF-parse to extract text from the PDF buffer
        const PDFData = yield Pdf(buff);
        console.log("Extracted text:", PDFData.text); // Log the extracted text
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error processing PDF file:", errorMessage);
        res.status(500).json({ error: "Failed to process PDF file", details: errorMessage });
    }
});
/**
 * Helper function to safely delete uploaded files
 */
function cleanupFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const normalizedPath = path.resolve(filePath); // Ensure absolute path for deletion
            yield fs.unlink(normalizedPath);
            console.log("File cleaned up successfully:", normalizedPath);
        }
        catch (error) {
            console.error("Error cleaning up file:", error);
        }
    });
}
