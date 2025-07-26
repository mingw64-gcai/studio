import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ShieldAlert, BellRing, Server } from "lucide-react";

export function MetricsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Current Density</CardDescription>
          <CardTitle className="text-4xl">75%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            +10% from last hour
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Threat Level</CardDescription>
          <CardTitle className="text-4xl text-destructive">High</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Anomalous patterns detected
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Alerts</CardDescription>
          <CardTitle className="text-4xl text-[hsl(var(--chart-3))]">3</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            2 high, 1 medium priority
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>System Status</CardDescription>
          <CardTitle className="text-4xl text-green-600">Online</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            All systems operational
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
