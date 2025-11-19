import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeDirection: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "accent" | "success" | "warning";
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeDirection, 
  icon: Icon,
  iconColor = "primary"
}: MetricCardProps) {
  const iconBgClass = {
    primary: "bg-primary-light text-primary",
    accent: "bg-accent-light text-accent",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning"
  };

  const changeColorClass = {
    up: "text-success",
    down: "text-destructive", 
    neutral: "text-muted-foreground"
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {value}
          </p>
          <p className={cn("text-sm font-medium", changeColorClass[changeDirection])}>
            {change}
          </p>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center",
          iconBgClass[iconColor]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}