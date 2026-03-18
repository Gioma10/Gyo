import { getAuth } from '@clerk/fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const requireAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = getAuth(request)

  if (!userId) {
    return reply.code(401).send({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
}