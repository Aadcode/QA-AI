import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const init = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",  // Configure this based on your needs
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,  // Configure timeout as needed
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};