import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

const start = async () => {
  await app.register(cors, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  await app.listen({ port: Number(process.env.PORT) || 3001 })
}

start()