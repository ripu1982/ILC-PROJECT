import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, Users, MessageSquare, BarChart3, Play, Pause } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "whatsapp" | "social" | "mixed";
  status: "active" | "paused" | "completed" | "scheduled";
  progress: number;
  sent: number;
  total: number;
  deliveryRate: number;
  openRate?: number;
  scheduledFor?: string;
}

interface CampaignStatusCardProps {
  campaign: Campaign;
  onToggle?: () => void;
  onViewDetails?: () => void;
}

export function CampaignStatusCard({ campaign, onToggle, onViewDetails }: CampaignStatusCardProps) {
  const getStatusBadge = () => {
    const variants = {
      active: "bg-success-light text-success",
      paused: "bg-warning-light text-warning",
      completed: "bg-muted text-muted-foreground",
      scheduled: "bg-primary-light text-primary"
    };

    return (
      <Badge className={cn("capitalize", variants[campaign.status])}>
        {campaign.status}
      </Badge>
    );
  };

  const getTypeIcon = () => {
    switch (campaign.type) {
      case "whatsapp":
        return "💬";
      case "social":
        return "📱";
      case "mixed":
        return "🔄";
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-lg">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {campaign.name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {campaign.type} campaign
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {campaign.status === "scheduled" && campaign.scheduledFor && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-primary-light rounded-lg">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Scheduled for {campaign.scheduledFor}
          </span>
        </div>
      )}

      {campaign.status !== "scheduled" && (
        <>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-foreground">
                {campaign.sent.toLocaleString()} / {campaign.total.toLocaleString()}
              </span>
            </div>
            <Progress value={campaign.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {campaign.deliveryRate}%
                </p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
            {campaign.openRate && (
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {campaign.openRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Opened</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex space-x-2">
        {campaign.status === "active" || campaign.status === "paused" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="flex items-center space-x-1"
          >
            {campaign.status === "active" ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Resume</span>
              </>
            )}
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex items-center space-x-1 flex-1"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Details</span>
        </Button>
      </div>
    </Card>
  );
}