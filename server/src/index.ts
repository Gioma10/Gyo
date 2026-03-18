import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { clerkPlugin } from '@clerk/fastify'
import { subscriptionsRoutes } from './routes/subscriptions.js'
import fp from 'fastify-plugin'

dotenv.config()

const app = Fastify({ logger: true })

const start = async () => {
  await app.register(cors, {
    origin: 'http://localhost:3000',
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

  await app.register(subscriptionsRoutes, { prefix: '/api/subscriptions' })

  await app.listen({ port: Number(process.env.PORT) || 8080 })
}

start()