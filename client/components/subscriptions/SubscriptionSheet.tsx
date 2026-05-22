import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { subscriptionSchema, type SubscriptionFormValues } from "@/lib/schemas/subscription";

import { recurrenceLabel, recurrenceOptions } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/schemas/subscription";

export const SubscriptionSheet = ({
    open,
    editing,
    onClose,
  }: {
    open: boolean;
    editing: Subscription | null;
    onClose: () => void;
  }) => {
    const [recOpen, setRecOpen] = useState(false);
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
  
    if (!open) return null;
  
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
  
        <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-surface px-5 pt-5 pb-8 max-w-lg mx-auto md:left-56">
          <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
  
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-foreground">
              {editing ? "Modifica abbonamento" : "Nuovo abbonamento"}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
  
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
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
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
              {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
            </Field>
  
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">Data primo rinnovo</FieldLabel>
              <Input
                {...register("startDate")}
                type="date"
                className="bg-muted border-border text-foreground focus-visible:ring-primary"
              />
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
                        onClick={() => { setValue("recurrence", r); setRecOpen(false); }}
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
        </div>
      </>
    );
  }