import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    icon: <AlertTriangle className="h-4 w-4 fill-black stroke-destructive" />,
    title: "High Density Alert",
    description: "Crowd density in Zone A has exceeded 90%.",
    time: "2m ago",
    priority: "High",
    variant: "destructive",
  },
  {
    id: 2,
    icon: <Info className="h-4 w-4" />,
    title: "Unusual Movement",
    description: "Anomalous flow pattern detected near main stage.",
    time: "5m ago",
    priority: "Medium",
    variant: "default",
  },
  {
    id: 3,
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "System Update",
    description: "AI model v1.2 has been successfully deployed.",
    time: "1h ago",
    priority: "Low",
    variant: "secondary",
  },
];

export function AlertsPanel() {
  return (
    <Card className="border-t-8 border-t-destructive">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Automated notifications from the system.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {alert.icon}
            </div>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{alert.title}</p>
                <Badge variant={alert.variant as any}>{alert.priority}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {alert.description}
              </p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
