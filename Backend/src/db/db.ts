import { PrismaClient } from "../../node_modules/.prisma/client/index.js";
declare global {
    var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
