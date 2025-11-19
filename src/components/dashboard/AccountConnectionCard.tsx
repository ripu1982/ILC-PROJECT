import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Settings } from "lucide-react";

interface Account {
  id: string;
  platform: "facebook" | "instagram" | "whatsapp" | "google";
  name: string;
  status: "connected" | "error" | "disconnected";
  lastSync?: string;
  pages?: number;
}

interface AccountConnectionCardProps {
  account: Account;
  onConnect?: () => void;
  onSettings?: () => void;
}

const platformIcons = {
  facebook: "📘",
  instagram: "📷", 
  whatsapp: "💬",
  google: "🏢"
};

const platformColors = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  whatsapp: "bg-green-500", 
  google: "bg-red-500"
};

export function AccountConnectionCard({ account, onConnect, onSettings }: AccountConnectionCardProps) {
  const getStatusIcon = () => {
    switch (account.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      connected: "bg-success-light text-success",
      error: "bg-warning-light text-warning", 
      disconnected: "bg-muted text-muted-foreground"
    };

    return (
      <Badge className={cn("capitalize", variants[account.status])}>
        {account.status}
      </Badge>
    );
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center text-white text-lg",
            platformColors[account.platform]
          )}>
            {platformIcons[account.platform]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground capitalize">
              {account.platform}
            </h3>
            <p className="text-sm text-muted-foreground">
              {account.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      {account.status === "connected" && (
        <div className="space-y-2 mb-4">
          {account.pages && (
            <p className="text-sm text-muted-foreground">
              {account.pages} pages connected
            </p>
          )}
          {account.lastSync && (
            <p className="text-sm text-muted-foreground">
              Last sync: {account.lastSync}
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {account.status === "disconnected" ? (
          <Button onClick={onConnect} className="flex-1">
            Connect Account
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            {account.status === "error" && (
              <Button onClick={onConnect} size="sm" className="flex-1">
                Reconnect
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}