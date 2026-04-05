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

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-border bg-surface px-4 py-6 gap-1">
      <div className="flex items-center gap-2 mb-8">
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

      {navItems.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        return (
          <Button
            asChild
            key={label}
            variant="ghost"
            className="justify-start gap-3 text-sm"
            style={{
              color: active ? "#1D9E75" : "#888",
              backgroundColor: active ? "#1D9E7520" : "transparent",
            }}
          >
            <Link href={href}>
              <Icon size={18} />
              {label}
            </Link>
          </Button>
        );
      })}
    </aside>
  );
}
