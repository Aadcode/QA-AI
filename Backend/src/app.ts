import express, { Request, Response, NextFunction } from 'express';
import uploadRoutes from './routes/upload.Routes.js';
import cors from 'cors';
import { createServer } from 'http';
import { init as initSocket } from './socket.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';

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
const io = initSocket(httpServer) as Server;

// Socket.IO connection setup
io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Real-time Q&A event handler
    socket.on('question', async (question: string) => {
        try {
            const document = await prisma.document.findFirst({
                orderBy: { createdAt: 'desc' }
            });

            if (!document) {
                socket.emit('answer', 'Document not found.');
                return;
            }

            // Generate response using Gemini
            const prompt = `Based on the document: "${document.content}" answer the question: "${question}"`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const answer = response.text();

            // Emit the answer
            socket.emit('answer', answer || "Sorry, I couldn't find an answer.");

            // Store Q&A in database
            await prisma.document.update({
                where: { id: document.id },
                data: {
                    QAs: {
                        push: { question, answer }
                    }
                },
            });

        } catch (error) {
            console.error('Error handling question:', error);
            socket.emit('answer', 'An error occurred while processing your question.');
        }
    });

    // Disconnect handler
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
    socket.on('error', (error: Error) => console.error('Socket error:', error));
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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