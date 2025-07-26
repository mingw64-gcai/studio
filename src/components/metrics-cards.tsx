
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ShieldAlert, BellRing, Server } from "lucide-react";
import { ThreatLevel } from "@/app/page";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  threatLevel: ThreatLevel;
  density: number;
}

export function MetricsCards({ threatLevel, density }: MetricsCardsProps) {

  const threatLevelConfig = {
    'Low': {
      text: 'Low',
      color: 'text-green-600',
      description: 'No immediate threats detected',
      alerts: 1,
    },
    'Moderate': {
      text: 'Moderate',
      color: 'text-[hsl(var(--chart-3))]',
      description: 'Minor anomalies detected',
      alerts: 3,
    },
    'High': {
      text: 'High',
      color: 'text-destructive',
      description: 'Anomalous patterns detected',
      alerts: 5,
    }
  }
  const currentThreat = threatLevelConfig[threatLevel];
  
  const getDensityColor = (percentage: number) => {
    if (percentage >= 75) {
      return 'text-destructive'; // Red
    } else if (percentage >= 50) {
      return 'text-[hsl(var(--chart-3))]'; // Yellow
    } else {
      return 'text-green-600'; // Green
    }
  };
  
  const getAlertColor = (count: number) => {
    if (count >= 5) {
      return 'text-destructive'; // Red
    } else if (count >= 3) {
      return 'text-[hsl(var(--chart-3))]'; // Yellow
    } else {
      return 'text-green-600'; // Green
    }
  }
  
  const getAlertsDescription = (level: ThreatLevel) => {
    switch (level) {
      case 'Low':
        return '1 low priority';
      case 'Moderate':
        return '2 medium, 1 low priority';
      case 'High':
        return '3 high, 2 medium priority';
      default:
        return '';
    }
  }


  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardDescription>Current Density</CardDescription>
          <CardTitle className={cn("text-4xl", getDensityColor(density))}>{density.toFixed(0)}%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Based on face count
          </div>
        </CardContent>
      </Card>
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardDescription>Threat Level</CardDescription>
          <CardTitle className={cn("text-4xl", currentThreat.color)}>{currentThreat.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {currentThreat.description}
          </div>
        </CardContent>
      </Card>
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardDescription>Active Alerts</CardDescription>
          <CardTitle className={cn("text-4xl", getAlertColor(currentThreat.alerts))}>
            {currentThreat.alerts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {getAlertsDescription(threatLevel)}
          </div>
        </CardContent>
      </Card>
      <Card className="border-t-4 border-t-primary">
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
