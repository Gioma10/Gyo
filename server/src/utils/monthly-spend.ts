import { prisma } from "../lib/prisma.js";
import { startOfMonth, totalForMonth } from "./spend.js";

/** Quanti mesi indietro al massimo manteniamo/riempiamo (tetto per rientri lunghi). */
const MONTHS_WINDOW = 12;

/** Aggiunge n mesi a una data, normalizzando al 1° del mese (UTC). n può essere negativo. */
function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 0, 0, 0, 0));
}

/**
 * Assicura che esista una riga MonthlySpend per ogni mese della finestra, per questo utente.
 *
 * - Mese corrente  → upsert con refresh (gli abbonamenti possono essere cambiati oggi).
 * - Mesi passati   → create solo se mancano; se esistono già NON si toccano (foto congelata).
 *
 * Copre con la stessa logica: backfill al primo accesso, gap-fill al rientro,
 * e refresh del mese corrente. Va chiamata quando l'utente carica la dashboard.
 */
export async function syncMonthlySpend(userId: string): Promise<void> {
  const subs = await prisma.subscription.findMany({
    where: { userId },
    select: { amount: true, recurrence: true, startDate: true, endDate: true },
  });

  // Nessun abbonamento → niente da fotografare.
  if (subs.length === 0) return;

  const now = new Date();
  const currentMonth = startOfMonth(now);

  // Tetto: non andiamo più indietro di MONTHS_WINDOW mesi (es. 12 → corrente + 11 precedenti).
  const cap = addMonths(currentMonth, -(MONTHS_WINDOW - 1));

  // Non ha senso fotografare mesi prima del primo abbonamento dell'utente.
  const earliest = subs.reduce(
    (min, s) => (s.startDate < min ? s.startDate : min),
    subs[0]!.startDate,
  );
  const earliestMonth = startOfMonth(earliest);

  // Partiamo dal più recente tra "primo abbonamento" e "tetto".
  const windowStart = earliestMonth > cap ? earliestMonth : cap;

  // Costruiamo l'elenco dei mesi da garantire, dal più vecchio al corrente.
  const months: Date[] = [];
  for (let m = windowStart; m <= currentMonth; m = addMonths(m, 1)) {
    months.push(m);
  }

  for (const month of months) {
    const total = totalForMonth(subs, month);
    const isCurrent = month.getTime() === currentMonth.getTime();

    await prisma.monthlySpend.upsert({
      where: { userId_month: { userId, month } },
      // mese corrente: aggiorna il totale; mesi passati: no-op se già esiste (congelato)
      update: isCurrent ? { total } : {},
      create: { userId, month, total },
    });
  }
}
