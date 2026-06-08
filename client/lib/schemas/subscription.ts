import { z } from "zod";

export const RECURRENCE_CONFIG = {
  WEEKLY:     { label: "Weekly",      days: 7,   multiplier: 4.33 },
  MONTHLY:    { label: "Monthly",     days: 30,  multiplier: 1 },
  QUARTERLY:  { label: "Quarterly",   days: 90,  multiplier: 1 / 3 },
  SEMIANNUAL: { label: "Semi-annual", days: 180, multiplier: 1 / 6 },
  ANNUAL:     { label: "Annual",      days: 365, multiplier: 1 / 12 },
} as const;

export const recurrenceSchema = z.enum(
  Object.keys(RECURRENCE_CONFIG) as [keyof typeof RECURRENCE_CONFIG, ...Array<keyof typeof RECURRENCE_CONFIG>]
);

export type Recurrence = z.infer<typeof recurrenceSchema>;

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Name required"),
  amount: z.string().min(1, "Amount required"),
  startDate: z.string().min(1, "Date required"),
  endDate: z.string().optional(), // "" = ancora attivo; "YYYY-MM-DD" = disdetto
  recurrence: recurrenceSchema,
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export const subscriptionResponseSchema = subscriptionSchema.extend({
  id: z.string(),
  userId: z.string(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Subscription = z.infer<typeof subscriptionResponseSchema>;
