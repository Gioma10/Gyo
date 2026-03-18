import type { FastifyInstance } from "fastify"
import { requireAuth } from "../plugins/requireAuth.js"

export const subscriptionsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', { preHandler: requireAuth }, async (request, reply) => {
    return []
  })
}