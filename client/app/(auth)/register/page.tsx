"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useClerk, useSignUp } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { match } from "ts-pattern";
import { zxcvbn } from "@zxcvbn-ts/core";
import { SecurityPasswordBar } from "@/components/securityPasswordBar";

const registerSchema = z
  .object({
    username: z.string().min(3, "Minimo 3 caratteri"),
    email: z.string().email("Email non valida"),
    password: z.string().min(8, "Minimo 8 caratteri"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState<string | null>(null);

  const password = watch("password");

  const passScore = useMemo(() => {
    if (!password) return 0;
    const score = zxcvbn(password).score;
    return score;
  }, [password]);

  console.log(passScore);

  const { signUp } = useSignUp();
  const { signOut } = useClerk();

  //   Login mutation
  const onRegister = useMutation({
    mutationFn: async (data: RegisterForm) => {
      if (!signUp) throw new Error("Non pronto");
      const emailAddress = data.email;
      const password = data.password;
      const username = data.username;

      const { error } = await signUp.password({
        emailAddress,
        password,
        username,
      });

      if (error) throw error;
      return signUp.status;
    },
    onSuccess: (status) => {
      console.log(status);
    },
    onError: (error: any) => {
      const code = error.errors?.[0]?.code;
      const message = match(code)
        .with(
          "form_password_pwned",
          () => "Password trovata in un data breach, usane una più sicura",
        )
        .with(
          "form_identifier_exists",
          () => "Username già utilizzato, scegline un altro",
        )
        .with("form_identifier_not_found", () => "Email non trovata")
        .with("session_exists", () => "Sei già loggato")
        .otherwise(() => "Qualcosa è andato storto");

      setError(message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    console.log(data);
    if (passScore < 3) {
        setError("La password deve essere almeno 'Buona'")
        return
      }
    onRegister.mutate(data);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md rounded-xl p-8 bg-surface border border-border">
          <div className="flex items-center gap-2 mb-7">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2 2 4-4" />
              </svg>
            </div>
            <span className="text-base font-medium text-foreground">
              Gyo Finance
            </span>
          </div>

          <div className="mb-1 text-2xl font-medium text-foreground">
            Crea account
          </div>
          <div
            className="text-sm mb-6 text-muted-foreground"
            style={{ lineHeight: 1.5 }}
          >
            Crea il tuo account per iniziare.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">
                Nickname
              </FieldLabel>
              <Input
                placeholder="giovanni99"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...register("username")}
              />
              <FieldError>{errors.username?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">
                Email
              </FieldLabel>
              <Input
                type="email"
                placeholder="giovanni@example.com"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">
                Password
              </FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">
                Conferma password
              </FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...register("confirmPassword")}
              />
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>
            <div id="clerk-captcha" />
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              Crea account
            </Button>
            {error && <div className="text-red-400">{error}</div>}

            {password && <SecurityPasswordBar score={passScore} error={error} />}
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Hai già un account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
      <button onClick={() => signOut()}>Logout</button>
    </>
  );
}
