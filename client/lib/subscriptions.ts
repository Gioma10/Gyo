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

/** Un abbonamento è attivo se non è stato disdetto o se la disdetta è nel futuro. */
export function isActive(s: Subscription): boolean {
  if (!s.endDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(s.endDate) >= today;
}

/** L'abbonamento attivo che si rinnova prima (o null se non ce ne sono). */
export function nextRenewal(subs: Subscription[]) {
  const active = subs.filter(isActive);
  if (active.length === 0) return null;
  return active
    .map((s) => ({ sub: s, days: daysUntilNextRenewal(s.startDate, s.recurrence) }))
    .sort((a, b) => a.days - b.days)[0];
}

/** Somma degli importi degli abbonamenti che si rinnovano da oggi a fine mese. */
export function dueThisMonth(subs: Subscription[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.floor((endOfMonth.getTime() - today.getTime()) / 86_400_000);

  return subs
    .filter(isActive)
    .filter((s) => daysUntilNextRenewal(s.startDate, s.recurrence) <= daysLeft)
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);
}
