"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/admin/events", label: "イベント管理" },
  { href: "/admin/participants", label: "参加者インサイト" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-[color:var(--info-bg)] text-[color:var(--info-foreground)] hover:bg-[color:var(--info-bg)]/80",
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
