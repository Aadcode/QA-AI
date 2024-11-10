var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import uploadRoutes from './routes/upload.Routes.js';
import cors from 'cors';
import { createServer } from 'http';
import { init as initSocket } from './socket.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Middleware setup
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use('/public', express.static('public'));
// API routes
app.use('/api/v1', uploadRoutes);
// Create HTTP server and initialize Socket.IO
const httpServer = createServer(app);
const io = initSocket(httpServer);
// Socket.IO connection setup
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Real-time Q&A event handler
    socket.on('question', (question) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const document = yield prisma.document.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            if (!document) {
                socket.emit('answer', 'Document not found.');
                return;
            }
            // Generate response using Gemini
            const prompt = `Based on the document: "${document.content}" answer the question: "${question}"`;
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            const answer = response.text();
            // Emit the answer
            socket.emit('answer', answer || "Sorry, I couldn't find an answer.");
            // Store Q&A in database
            yield prisma.document.update({
                where: { id: document.id },
                data: {
                    QAs: {
                        push: { question, answer }
                    }
                },
            });
        }
        catch (error) {
            console.error('Error handling question:', error);
            socket.emit('answer', 'An error occurred while processing your question.');
        }
    }));
    // Disconnect handler
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
    socket.on('error', (error) => console.error('Socket error:', error));
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Express error handler:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
