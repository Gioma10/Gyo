"use client"

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const AssertAuth = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return fallback ?? null;

  if (!isSignedIn) {
    redirect("/login");
  }

  return children;
};
