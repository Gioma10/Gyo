import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const AssertAuth = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <Loader2 className="animate-spin" />;

  if (!isSignedIn) {
    redirect("/login");
  }

  return children;
};
