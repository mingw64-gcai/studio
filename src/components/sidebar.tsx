
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LineChart, ImageIcon, Map } from 'lucide-react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/crowd-hotspots', label: 'Crowd Heatmap', icon: ImageIcon },
  { href: '/map-analysis', label: 'Map Analysis', icon: Map },
]

interface SidebarProps {
  isSheet?: boolean;
}

export function Sidebar({ isSheet = false }: SidebarProps) {
  const pathname = usePathname()

  const commonLinkClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  const activeLinkClasses = "bg-accent text-accent-foreground hover:text-foreground";
  const sheetLinkClasses = "gap-4 px-2.5";
  const sheetActiveLinkClasses = "text-foreground";

  const renderLink = (link: typeof navLinks[0]) => {
     const isActive = pathname === link.href;
     return (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
              commonLinkClasses,
              isSheet && sheetLinkClasses,
              isActive && (isSheet ? sheetActiveLinkClasses : activeLinkClasses)
          )}
        >
          <link.icon className={cn("h-4 w-4", isSheet && "h-5 w-5")} />
          {link.label}
        </Link>
     )
  }

  if (isSheet) {
    return (
      <nav className="grid gap-6 text-lg font-medium">
        <Link
          href="#"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Drishti AI</span>
        </Link>
        {navLinks.map(renderLink)}
      </nav>
    )
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col gap-4 px-4 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 shrink-0 items-center gap-2 rounded-full bg-primary px-3 text-lg font-semibold text-primary-foreground md:h-8 md:text-base"
        >
          <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="font-semibold">Drishti AI</span>
        </Link>
        <div className="flex flex-col gap-y-2">
            {navLinks.map(renderLink)}
        </div>
      </nav>
    </aside>
  )
}
