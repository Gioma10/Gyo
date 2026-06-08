import type { Recurrence } from "../generated/prisma/enums.js";

/**
 * Quanto pesa al mese ogni ricorrenza, con l'importo "spalmato" sull'anno.
 * Es. un annuale da 120€ pesa 120 * (1/12) = 10€ al mese.
 * WEEKLY usa 52/12 (settimane in un mese medio) invece di 4.33 arrotondato,
 * così il dato persistito è leggermente più preciso.
 */
const MONTHLY_FACTOR: Record<Recurrence, number> = {
  WEEKLY: 52 / 12,
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  SEMIANNUAL: 1 / 6,
  ANNUAL: 1 / 12,
};

/** Costo mensile spalmato di un singolo abbonamento. */
export function monthlyEquivalent(amount: string, recurrence: Recurrence): number {
  const value = Number(amount); // amount è String nel DB → va parsato
  if (!Number.isFinite(value)) return 0; // importo invalido → non somma nulla
  return value * MONTHLY_FACTOR[recurrence];
}

/** Forma minima di cui questa logica ha bisogno (non serve l'intero model Prisma). */
type SubscriptionLike = {
  amount: string;
  recurrence: Recurrence;
  startDate: Date;
  endDate: Date | null;
};

/** Primo istante del mese (UTC) della data passata. Es. 2026-03-14 → 2026-03-01T00:00:00Z. */
export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** Ultimo istante del mese (UTC). Es. marzo → 2026-03-31T23:59:59.999Z. */
export function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0) - 1);
}

/**
 * Totale degli abbonamenti ATTIVI in un dato mese, sommando i loro equivalenti mensili.
 *
 * Un abbonamento è attivo nel mese M se:
 *   - è iniziato entro la fine di M           → startDate <= fine M
 *   - E non è finito prima dell'inizio di M    → endDate è null OPPURE endDate >= inizio M
 *
 * Così il mese dello startDate conta, e anche il mese dell'endDate conta
 * (paghi il mese in cui disdici). È la stessa logica per mese corrente,
 * mesi-buco e backfill: cambia solo il `month` che passi.
 */
export function totalForMonth(subscriptions: SubscriptionLike[], month: Date): number {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const total = subscriptions
    .filter((s) => s.startDate <= end && (s.endDate === null || s.endDate >= start))
    .reduce((acc, s) => acc + monthlyEquivalent(s.amount, s.recurrence), 0);

  // arrotonda a 2 decimali, coerente con Decimal(10, 2) della colonna total
  return Math.round(total * 100) / 100;
}
