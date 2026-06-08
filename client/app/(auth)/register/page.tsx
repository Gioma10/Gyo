"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useSignUp } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { match } from "ts-pattern";
import { zxcvbn } from "@zxcvbn-ts/core";
import { BarScorePassword } from "@/components/auth/BarScorePassword";
import { useRouter } from "next/navigation";

const registerSchema = z
  .object({
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
  const router = useRouter();
  const password = watch("password");

  const passScore = useMemo(() => {
    if (!password) return 0;
    const score = zxcvbn(password).score;
    return score;
  }, [password]);

  const { signUp } = useSignUp();

  //   Login mutation
  const onRegister = useMutation({
    mutationFn: async (data: RegisterForm) => {
      if (!signUp) throw new Error("Not ready");
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
      router.push("/");
    },
    onError: (error: any) => {
      const code = error.errors?.[0]?.code;
      const message = match(code)
        .with(
          "form_password_pwned",
          () => "Password found in a data breach, use a stronger one",
        )
        .with(
          "form_identifier_exists",
          () => "Username already in use, choose another",
        )
        .with("form_email_address_exists", () => "Email already in use")
        .with("form_identifier_not_found", () => "Email not found")
        .with("session_exists", () => "You are already logged in")
        .with(
          "too_many_requests",
          () => "Too many attempts, try again in a few minutes",
        )
        .with(
          "form_password_size_in_bytes_exceeded",
          () => "Password too long",
        )
        .with(
          "form_username_invalid_character",
          () => "The username contains invalid characters",
        )
        .with("form_username_too_short", () => "The username is too short")
        .with("form_username_too_long", () => "The username is too long")
        .with("form_param_nil", () => "Fill in all fields")
        .with("form_param_format_invalid", () => "Invalid format")
        .otherwise(
          () => error.errors?.[0]?.message ?? "Something went wrong",
        );

      setError(message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    if (passScore < 3) {
      setError("The password must be at least 'Good'");
      return;
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
            Create account
          </div>
          <div
            className="text-sm mb-6 text-muted-foreground"
            style={{ lineHeight: 1.5 }}
          >
            Create your account to get started.
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
              <PasswordInput
                placeholder="••••••••"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground text-xs">
                Confirm password
              </FieldLabel>
              <PasswordInput
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
              Create account
            </Button>
            {error && <FieldError>{error}</FieldError>}

            {password && <BarScorePassword score={passScore} error={error} />}
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
