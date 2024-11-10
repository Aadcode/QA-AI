import { Server as SocketIOServer } from 'socket.io';
let io;
export const init = (httpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", // Configure this based on your needs
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000, // Configure timeout as needed
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
