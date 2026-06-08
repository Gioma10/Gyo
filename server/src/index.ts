import 'dotenv/config' 
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { clerkPlugin, getAuth } from '@clerk/fastify'
import { subscriptionsRoutes } from './routes/subscriptions.js'
import { monthlySpendRoutes } from './routes/monthly-spend.js'
import fp from 'fastify-plugin'
import { webhookRoutes } from './routes/webhook.js'
import { userRoutes } from './routes/user/index.js'


const app = Fastify({ logger: true })

const start = async () => {
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[]

  await app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY

  if (!publishableKey || !secretKey) {
    throw new Error('CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY must be set')
  }

  await app.register(fp(clerkPlugin), { publishableKey, secretKey })

  app.decorate('requireAuth', async (req: any, reply: any) => {
    const auth = getAuth(req)
    if (!auth.userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    req.auth = auth
  })

  await app.register(subscriptionsRoutes, { prefix: '/api/subscriptions' })

  await app.register(monthlySpendRoutes, { prefix: '/api/monthly-spend' })

  await app.register(userRoutes, { prefix: '/api/user' })

  await app.register(webhookRoutes);

  await app.listen({ port: Number(process.env.PORT) || 8080, host: '0.0.0.0' })
}

start()