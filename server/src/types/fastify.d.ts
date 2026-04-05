import { SignedInAuthObject } from '@clerk/fastify'

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (req: any, reply: any) => Promise<void>
  }
  interface FastifyRequest {
    auth: SignedInAuthObject
  }
}