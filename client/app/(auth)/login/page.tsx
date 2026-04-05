"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "Minimo 8 caratteri"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const { signIn } = useSignIn();
  const [clerkError, setClerkError] = useState<string | null>(null);
  const router = useRouter();

  const onLogin = useMutation({
    mutationFn: async (data: LoginForm) => {
      if (!signIn) throw new Error("Non pronto");
    
      const { error } = await signIn.password({
        emailAddress: data.email,
        password: data.password,
      });
    
      if (error) throw error;
    
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            router.push(url);
          },
        });
      } else {
        throw new Error(`Stato inatteso: ${signIn.status}`);
      }
    },
    onSuccess: (status) => {
      console.log(status);
      router.push("/");
    },
    onError: (error: any) => {
      const code = error.errors?.[0]?.code;
      const message = match(code)
        .with("form_password_incorrect", () => "Password errata")
        .with("form_identifier_not_found", () => "Nessun account trovato con questa email")
        .with("session_exists", () => "Sei già loggato")
        .with("too_many_requests", () => "Troppi tentativi, riprova tra qualche minuto")
        .with("form_param_format_invalid", () => "Formato email non valido")
        .with("form_identifier_exists", () => "Account già esistente")
        .otherwise(() => error.errors?.[0]?.message ?? "Qualcosa è andato storto");
      setClerkError(message);
    },
  });

  const onSubmit = (data: LoginForm) => {
    setClerkError(null);
    onLogin.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-xl p-8 bg-surface border border-border">

        <div className="flex items-center gap-2 mb-7">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
          </div>
          <span className="text-base font-medium text-foreground">Gyo Finance</span>
        </div>

        <div className="mb-1 text-2xl font-medium text-foreground">Bentornato</div>
        <div className="text-sm mb-6 text-muted-foreground" style={{ lineHeight: 1.5 }}>
          Accedi al tuo account per continuare.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel className="text-muted-foreground text-xs">Email</FieldLabel>
            <Input
              type="email"
              placeholder="giovanni@example.com"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>
          <Field>
            <div className="flex justify-between items-center">
              <FieldLabel className="text-muted-foreground text-xs">Password</FieldLabel>
              <span className="text-xs cursor-pointer text-primary">Password dimenticata?</span>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
            Accedi
          </Button>
          {clerkError && <FieldError>{clerkError}</FieldError>}
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Non hai un account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}