import { AssertAuth } from "@/components/auth/AssertAuth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AssertAuth>{children}</AssertAuth>;
}
