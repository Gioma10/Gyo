import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";


export const userRoutes = async (fastify: FastifyInstance) =>{

    fastify.get("/", { preHandler: fastify.requireAuth}, async (req, reply) => {
        const { userId } = req.auth;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return reply.send(user);
    });
}