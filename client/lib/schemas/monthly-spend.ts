import { z } from "zod";

// La risposta di GET /api/monthly-spend.
// month = ISO date string (1° del mese); total = Decimal serializzato come stringa.
export const monthlySpendSchema = z.object({
  month: z.string(),
  total: z.string(),
});

export type MonthlySpend = z.infer<typeof monthlySpendSchema>;
