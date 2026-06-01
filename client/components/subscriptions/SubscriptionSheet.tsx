import { useState } from "react";
import { ChevronDown, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { subscriptionSchema, type SubscriptionFormValues } from "@/lib/schemas/subscription";
import { recurrenceLabel, recurrenceOptions } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/schemas/subscription";
import { useBreakpoint } from "@/utils/hooks/useBreakpoint";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

function parseDateString(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SubscriptionForm({
  editing,
  onClose,
}: {
  editing: Subscription | null;
  onClose: () => void;
}) {
  const [recOpen, setRecOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const breakpoint = useBreakpoint();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: editing?.name ?? "",
      amount: editing?.amount,
      startDate: editing?.startDate ? editing.startDate.slice(0, 10) : "",
      recurrence: editing?.recurrence ?? "MONTHLY",
    },
  });

  const recurrence = watch("recurrence");

  const mutation = useMutation({
    mutationFn: async (data: SubscriptionFormValues) => {
      const url = editing ? `/api/subscriptions/${editing.id}` : "/api/subscriptions";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Errore nel salvataggio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 p-4"
    >
      <Field>
        <FieldLabel className="text-muted-foreground text-xs">Nome</FieldLabel>
        <Input
          {...register("name")}
          placeholder="es. Netflix"
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className="text-muted-foreground text-xs">Importo (€)</FieldLabel>
        <Input
          {...register("amount")}
          type="number"
          step="0.01"
          min={0}
          placeholder="0.00"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className="text-muted-foreground text-xs">Data primo rinnovo</FieldLabel>
        {breakpoint === "desktop" ? (
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground"
              >
                <span className={watch("startDate") ? "text-foreground" : "text-muted-foreground"}>
                  {watch("startDate")
                    ? parseDateString(watch("startDate"))?.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
                    : "Seleziona una data"}
                </span>
                <CalendarIcon size={14} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <Calendar
                mode="single"
                selected={parseDateString(watch("startDate"))}
                onSelect={(date) => {
                  if (date) {
                    setValue("startDate", toDateString(date));
                    setCalOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <Input
            {...register("startDate")}
            type="date"
            className="bg-muted border-border text-foreground focus-visible:ring-primary"
          />
        )}
        {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className="text-muted-foreground text-xs">Ricorrenza</FieldLabel>
        <div className="relative">
          <button
            type="button"
            onClick={() => setRecOpen(!recOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground"
          >
            {recurrenceLabel[recurrence]}
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          {recOpen && (
            <div className="absolute bottom-full mb-1 left-0 right-0 rounded-md border border-border bg-surface overflow-hidden z-10">
              {recurrenceOptions.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setValue("recurrence", r);
                    setRecOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  style={{ color: r === recurrence ? "#1D9E75" : undefined }}
                >
                  {recurrenceLabel[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>

      {mutation.isError && (
        <p className="text-xs text-red-400">{mutation.error.message}</p>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full mt-2"
        style={{ backgroundColor: "#1D9E75", color: "#fff" }}
      >
        {mutation.isPending
          ? "Salvataggio..."
          : editing
          ? "Salva modifiche"
          : "Aggiungi abbonamento"}
      </Button>
    </form>
  );
}

export const SubscriptionSheet = ({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Subscription | null;
  onClose: () => void;
}) => {
  const breakpoint = useBreakpoint();
  const title = editing ? "Modifica abbonamento" : "Nuovo abbonamento";

  if (breakpoint === "mobile") {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <SubscriptionForm editing={editing} onClose={onClose} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SubscriptionForm editing={editing} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
