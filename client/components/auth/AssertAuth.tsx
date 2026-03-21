import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const AssertAuth = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isLoaded || !isSignedIn) {
    redirect("/login");
  }

  return children;
};
