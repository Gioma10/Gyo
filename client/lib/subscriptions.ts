import { RECURRENCE_CONFIG, type Recurrence, type Subscription } from "@/lib/schemas/subscription";

export const recurrenceOptions = Object.keys(RECURRENCE_CONFIG) as Recurrence[];

export const recurrenceLabel = Object.fromEntries(
  Object.entries(RECURRENCE_CONFIG).map(([k, v]) => [k, v.label])
) as Record<Recurrence, string>;

export function daysUntilNextRenewal(startDate: string, recurrence: Recurrence): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const interval = RECURRENCE_CONFIG[recurrence].days;
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remainder = diffDays % interval;
  return remainder === 0 ? 0 : interval - remainder;
}

export function nextRenewalDate(startDate: string, recurrence: Recurrence): string {
  const days = daysUntilNextRenewal(startDate, recurrence);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
}

export function totalMonthly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + parseFloat(s.amount) * RECURRENCE_CONFIG[s.recurrence].multiplier, 0);
}
