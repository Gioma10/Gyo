import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { syncMonthlySpend } from "../utils/monthly-spend.js";

export const monthlySpendRoutes = async (fastify: FastifyInstance) => {
  // GET - spesa mensile dell'utente (ultimi 6 mesi, in ordine cronologico)
  fastify.get(
    "/",
    { preHandler: [fastify.requireAuth] },
    async (req, reply) => {
      const { userId } = req.auth;

      // scatta/aggiorna le foto (corrente + backfill + gap-fill) prima di leggere
      await syncMonthlySpend(userId);

      const spends = await prisma.monthlySpend.findMany({
        where: { userId },
        orderBy: { month: "desc" },
        take: 6,
        select: { month: true, total: true },
      });

      // dal più vecchio al più recente, come si legge un grafico
      return reply.send(spends.reverse());
    },
  );
};
