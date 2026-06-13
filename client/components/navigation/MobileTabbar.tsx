"use client";

import { LayoutGrid, ArrowLeftRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/transactions" },
  { label: "Subscriptions", icon: Clock, href: "/subscriptions" },
  { label: "Profile", icon: User, href: "/account" },
];

export function MobileTabbar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border bg-background">
      {navItems.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        return (
          <Button
            asChild
            key={label}
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto w-full min-w-0 py-1 px-1"
          >
            <Link href={href}>
              <Icon size={18} style={{ color: active ? "#1D9E75" : "#555" }} />
              <span
                className="text-xs max-w-full truncate"
                style={{ color: active ? "#1D9E75" : "#555" }}
              >
                {label.toLowerCase()}
              </span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
