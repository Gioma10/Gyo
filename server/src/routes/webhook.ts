import type { FastifyInstance } from "fastify";
import { Webhook } from "svix";
import { prisma } from "../lib/prisma.js";

export const webhookRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/webhooks/clerk", async (req, reply) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET!;
    const wh = new Webhook(secret);

    const headers = {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    };

    let event: any;

    try {
      event = wh.verify(JSON.stringify(req.body), headers);
    } catch (err) {
      return reply.status(400).send({ error: "Invalid webhook signature" });
    }

    if (event.type === "user.created") {
        const { id, email_addresses, username } = event.data;
        const email = email_addresses?.[0]?.email_address;
      
        if (!email) return reply.status(200).send({ received: true });
      
        await prisma.user.create({
          data: {
            id,
            email,
            username: username ?? null,
          },
        });
      }

    return reply.status(200).send({ received: true });
  });
};