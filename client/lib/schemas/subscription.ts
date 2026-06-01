import { z } from "zod";

export const RECURRENCE_CONFIG = {
  WEEKLY:     { label: "Settimanale", days: 7,   multiplier: 4.33 },
  MONTHLY:    { label: "Mensile",     days: 30,  multiplier: 1 },
  QUARTERLY:  { label: "Trimestrale", days: 90,  multiplier: 1 / 3 },
  SEMIANNUAL: { label: "Semestrale",  days: 180, multiplier: 1 / 6 },
  ANNUAL:     { label: "Annuale",     days: 365, multiplier: 1 / 12 },
} as const;

export const recurrenceSchema = z.enum(
  Object.keys(RECURRENCE_CONFIG) as [keyof typeof RECURRENCE_CONFIG, ...Array<keyof typeof RECURRENCE_CONFIG>]
);

export type Recurrence = z.infer<typeof recurrenceSchema>;

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  amount: z.string().min(1, "Importo obbligatorio"),
  startDate: z.string().min(1, "Data obbligatoria"),
  recurrence: recurrenceSchema,
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export const subscriptionResponseSchema = subscriptionSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Subscription = z.infer<typeof subscriptionResponseSchema>;
