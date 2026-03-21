"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { match } from "ts-pattern";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

type Step = "email" | "login" | "register";

const emailSchema = z.object({
  email: z.string().email("Email non valida"),
});

const loginSchema = z.object({
  password: z.string().min(8, "Minimo 8 caratteri"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Minimo 3 caratteri"),
    password: z.string().min(8, "Minimo 8 caratteri"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

type EmailForm = z.infer<typeof emailSchema>;
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const btnStyle = { backgroundColor: "#1D9E75" };

function StyledButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
      style={btnStyle}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#18876A")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1D9E75")}
    >
      {children}
    </button>
  );
}

export default function AuthPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const { signIn } = useSignIn();

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const checkEmail = useMutation({
    mutationFn: async (data: EmailForm) => {
      if (!signIn) throw new Error("Non pronto")
      await signIn.create({ identifier: data.email })
      return signIn.isTransferable
    },
    onSuccess: (isTransferable) => {
      setEmail(emailForm.getValues("email"))
      isTransferable ? setStep("register") : setStep("login")
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const onLoginSubmit = (data: LoginForm) => {
    console.log("Login:", { email, ...data });
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    console.log("Register:", { email, ...data });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      <div
        className="w-full max-w-md rounded-xl p-8"
        style={{ backgroundColor: "#1a1a1a", border: "0.5px solid #2a2a2a" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#1D9E75" }}
          >
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
          <span className="text-base font-medium" style={{ color: "#f5f5f5" }}>
            Gyo Finance
          </span>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 mb-6">
          <div
            className="h-0.5 flex-1 rounded-full transition-all"
            style={{
              backgroundColor: step === "email" ? "#1D9E75" : "#0F6E56",
            }}
          />
          <div
            className="h-0.5 flex-1 rounded-full transition-all"
            style={{
              backgroundColor:
                step === "login" || step === "register" ? "#1D9E75" : "#2a2a2a",
            }}
          />
        </div>

        {/* Title */}
        <div className="mb-1 text-2xl font-medium" style={{ color: "#f5f5f5" }}>
          {match(step)
            .with("email", () => "Benvenuto")
            .with("login", () => "Bentornato")
            .with("register", () => "Crea account")
            .exhaustive()}
        </div>

        {/* Subtitle */}
        <div
          className="text-sm mb-6"
          style={{ color: "#888", lineHeight: 1.5 }}
        >
          {match(step)
            .with(
              "email",
              () =>
                "Inserisci la tua email per continuare. Se non hai un account lo creeremo insieme.",
            )
            .with("login", () => "Abbiamo trovato un account con questa email.")
            .with(
              "register",
              () => "Nessun account trovato. Creiamone uno insieme.",
            )
            .exhaustive()}
        </div>

        {/* Email chip */}
        {step !== "email" && (
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
            style={{ backgroundColor: "#111", border: "0.5px solid #2a2a2a" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,12 2,6" />
            </svg>
            <span className="text-xs font-medium" style={{ color: "#f5f5f5" }}>
              {email}
            </span>
          </div>
        )}

        {/* Forms */}
        {match(step)
          .with("email", () => (
            <form
              onSubmit={emailForm.handleSubmit((data) =>
                checkEmail.mutate(data),
              )}
              className="space-y-4"
            >
              <Field>
                <FieldLabel style={{ color: "#888", fontSize: "12px" }}>
                  Email
                </FieldLabel>
                <Input
                  type="email"
                  placeholder="giovanni@example.com"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...emailForm.register("email")}
                />
                <FieldError>
                  {emailForm.formState.errors.email?.message}
                </FieldError>
              </Field>
              <StyledButton type="submit">Continua</StyledButton>
            </form>
          ))
          .with("login", () => (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <Field>
                <div className="flex justify-between items-center">
                  <FieldLabel style={{ color: "#888", fontSize: "12px" }}>
                    Password
                  </FieldLabel>
                  <span
                    className="text-xs cursor-pointer"
                    style={{ color: "#1D9E75" }}
                  >
                    Password dimenticata?
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...loginForm.register("password")}
                />
                <FieldError>
                  {loginForm.formState.errors.password?.message}
                </FieldError>
              </Field>
              <StyledButton type="submit">Accedi</StyledButton>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-center py-2"
                style={{ color: "#888" }}
              >
                ← Cambia email
              </button>
            </form>
          ))
          .with("register", () => (
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <Field>
                <FieldLabel style={{ color: "#888", fontSize: "12px" }}>
                  Nickname
                </FieldLabel>
                <Input
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  placeholder="giovanni99"
                  {...registerForm.register("username")}
                />
                <FieldError>
                  {registerForm.formState.errors.username?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel style={{ color: "#888", fontSize: "12px" }}>
                  Password
                </FieldLabel>
                <Input
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                />
                <FieldError>
                  {registerForm.formState.errors.password?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel style={{ color: "#888", fontSize: "12px" }}>
                  Conferma password
                </FieldLabel>
                <Input
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("confirmPassword")}
                />
                <FieldError>
                  {registerForm.formState.errors.confirmPassword?.message}
                </FieldError>
              </Field>
              <StyledButton type="submit">Crea account</StyledButton>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-center py-2"
                style={{ color: "#888" }}
              >
                ← Cambia email
              </button>
            </form>
          ))
          .exhaustive()}
      </div>
    </div>
  );
}
