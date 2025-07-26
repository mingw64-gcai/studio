
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LineChart, ImageIcon, Map, Footprints, UserSearch, Video, AlertTriangle } from 'lucide-react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/live-video', label: 'Live Video', icon: Video },
  { href: '/crowd-hotspots', label: 'Chart Analysis', icon: ImageIcon },
  { href: '/path-prediction', label: 'Path Prediction', icon: Footprints },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/map-analysis', label: 'Map Analysis', icon: Map },
  { href: '/lost-and-found', label: 'Lost and Found', icon: UserSearch },
]

interface SidebarProps {
  isSheet?: boolean;
}

export function Sidebar({ isSheet = false }: SidebarProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleSosClick = async () => {
    try {
      const response = await fetch('https://us-central1-avid-ceiling-466717-i9.cloudfunctions.net/alerts', {
        method: 'POST',
        mode: 'no-cors', // Add this line to fix CORS issue
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: '🔥 Fire in Block C! Please Evacuate!' }),
      });

      // With no-cors, we can't check response.ok, so we assume success if no error is thrown
      toast({
        title: 'SOS Alert Sent!',
        description: 'Emergency services have been notified.',
      });

    } catch (error) {
      console.error('SOS request failed', error);
      toast({
        variant: 'destructive',
        title: 'SOS Failed',
        description: 'An error occurred while sending the alert.',
      });
    }
  };


  const commonLinkClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  const activeLinkClasses = "bg-[hsl(var(--chart-4))] text-primary-foreground hover:text-primary-foreground/90";
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
          className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Icons.logo className="h-6 w-6 transition-all group-hover:scale-110" />
          <span className="sr-only">Drishti AI</span>
        </Link>
        {navLinks.map(renderLink)}
         <div className="mt-auto">
            <Button onClick={handleSosClick} variant="destructive" className="w-full text-lg font-bold h-14">
                <AlertTriangle className="mr-2 h-4 w-4" />
                SOS
            </Button>
        </div>
      </nav>
    )
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-full flex-col">
        <nav className="flex flex-col gap-4 px-4 sm:py-5">
            <div className="flex flex-col items-center gap-2">
                <Link href="/" className="group flex items-center justify-center">
                    <Icons.logo className="h-20 w-20 transition-all group-hover:scale-110" />
                </Link>
                <div
                className="group flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-primary-foreground"
                >
                <span className="whitespace-nowrap text-xl font-bold">Drishti AI</span>
                </div>
                <span className="font-semibold whitespace-nowrap text-sm">Mingw64</span>
            </div>
            <div className="flex flex-col gap-y-2">
                {navLinks.map(renderLink)}
            </div>
        </nav>
        <div className="mt-auto p-4">
             <Button onClick={handleSosClick} variant="destructive" className="w-full text-lg font-bold h-14">
                <AlertTriangle className="mr-2 h-4 w-4" />
                SOS
            </Button>
        </div>
      </div>
    </aside>
  )
}
