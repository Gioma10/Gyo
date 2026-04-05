import { AssertAuth } from "@/components/auth/AssertAuth";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileTabbar } from "@/components/navigation/MobileTabbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <AssertAuth>{children}</AssertAuth>
      </main>
      <MobileTabbar />
    </div>
  );
}
