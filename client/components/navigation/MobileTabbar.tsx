"use client";

import { LayoutGrid, ArrowLeftRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "Transazioni", icon: ArrowLeftRight, href: "/transazioni" },
  { label: "Abbonamenti", icon: Clock, href: "/abbonamenti" },
  { label: "Profilo", icon: User, href: "/account" },
];

export function MobileTabbar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 border-t border-border bg-background">
      {navItems.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        return (
          <Button
            asChild
            key={label}
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-1 px-3"
          >
            <Link href={href}>
              <Icon size={18} style={{ color: active ? "#1D9E75" : "#555" }} />
              <span
                className="text-xs"
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
