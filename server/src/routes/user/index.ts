import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { createClerkClient } from "@clerk/fastify";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export const userRoutes = async (fastify: FastifyInstance) => {

    fastify.get("/", { preHandler: fastify.requireAuth }, async (req, reply) => {
        const { userId } = req.auth;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return reply.send(user);
    });

    fastify.patch("/", { preHandler: fastify.requireAuth }, async (req, reply) => {
        const { userId } = req.auth;
        const { username } = req.body as { username: string };

        const updated = await clerk.users.updateUser(userId, { username });

        await prisma.user.update({
            where: { id: userId },
            data: { username: updated.username },
        });

        return reply.send({ username: updated.username });
    });

    fastify.delete("/", { preHandler: fastify.requireAuth }, async (req, reply) => {
        const { userId } = req.auth;

        await clerk.users.deleteUser(userId);
        await prisma.user.delete({ where: { id: userId } });

        return reply.send({ success: true });
    });
}