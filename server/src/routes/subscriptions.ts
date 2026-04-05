import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  startDate: z.string().datetime(),
  recurrence: z.enum([
    "WEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "SEMIANNUAL",
    "ANNUAL",
  ]),
});

export const subscriptionsRoutes = async (fastify: FastifyInstance) => {
  // GET - lista abbonamenti utente
  fastify.get(
    "/",
    { preHandler: [fastify.requireAuth] },
    async (req, reply) => {
      const { userId } = req.auth;

      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { startDate: "asc" },
      });

      return reply.send(subscriptions);
    },
  );

  // POST - crea abbonamento
  fastify.post(
    "/",
    { preHandler: [fastify.requireAuth] },
    async (req, reply) => {
      const { userId } = req.auth;
      const body = subscriptionSchema.parse(req.body);

      const subscription = await prisma.subscription.create({
        data: { ...body, userId },
      });

      return reply.status(201).send(subscription);
    },
  );

  // PATCH - modifica abbonamento
  fastify.patch(
    "/:id",
    { preHandler: [fastify.requireAuth] },
    async (req, reply) => {
      const { userId } = req.auth;
      const { id } = req.params as { id: string };
      const body = subscriptionSchema.partial().parse(req.body);

      // rimuovi i campi undefined
      const data = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== undefined),
      );

      const subscription = await prisma.subscription.update({
        where: { id, userId },
        data,
      });

      return reply.send(subscription);
    },
  );

  // DELETE - elimina abbonamento
  fastify.delete(
    "/:id",
    { preHandler: [fastify.requireAuth] },
    async (req, reply) => {
      const { userId } = req.auth;
      const { id } = req.params as { id: string };

      await prisma.subscription.delete({
        where: { id, userId },
      });

      return reply.status(204).send();
    },
  );
};
