
import { Sidebar } from '@/components/sidebar'
import { UserNav } from '@/components/user-nav'
import { MetricsCards } from '@/components/metrics-cards'
import { VideoFeed } from '@/components/video-feed'
import { AlertsPanel } from '@/components/alerts-panel'
import { AnalysisPanel } from '@/components/analysis-panel'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PanelLeft } from 'lucide-react'
import { CrowdProblemSolver } from '@/components/crowd-problem-solver'


export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <Sidebar isSheet={true} />
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
           <MetricsCards />
           <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <div className="grid auto-rows-max items-start gap-4 md:gap-8 xl:col-span-2">
                 <VideoFeed />
                 <CrowdProblemSolver />
              </div>
              <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                 <AlertsPanel />
                 <AnalysisPanel />
              </div>
            </div>
        </main>
      </div>
    </div>
  )
}
