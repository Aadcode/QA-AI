import { PrismaClient } from "../../node_modules/.prisma/client/index.js";
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production")
    global.prisma = prisma;
export default prisma;
