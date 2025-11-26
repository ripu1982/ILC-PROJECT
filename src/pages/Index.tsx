import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AccountConnectionCard } from "@/components/dashboard/AccountConnectionCard";
import { CampaignStatusCard } from "@/components/dashboard/CampaignStatusCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Calendar,
  Plus,
  TrendingUp,
  Target,
  Eye
} from "lucide-react";

interface Account {
  id: string;
  platform: "facebook" | "instagram" | "whatsapp" | "google";
  name: string;
  status: "connected" | "error" | "disconnected";
  lastSync?: string;
  pages?: number;
}

const Index = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const formatTimeAgo = (timestamp: string) => {
    const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  useEffect(() => {
    fetch("http://13.201.76.47/api/facebook/page-info")
      .then(res => res.json())
      .then((data) => {
        setAccounts([
          {
            id: data.page_id,
            platform: "facebook",
            name: data.page_name,
            status: data.connected ? "connected" : "error",
            lastSync: formatTimeAgo(data.last_sync),
            pages: data.pages
          }
        ]);
      })
      .catch(() => {
        setAccounts([
          {
            id: "facebook",
            platform: "facebook",
            name: "Not Connected",
            status: "error"
          }
        ]);
      });
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/" />
      
      <main className="flex-1 overflow-auto">
        
        {/* HEADER */}
        <div className="border-b border-border bg-card">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your social media automation from one place
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="p-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Connected Accounts */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Connected Accounts</h2>

              <div className="space-y-4">
                {accounts.map((account) => (
                  <AccountConnectionCard
                    key={account.id}
                    account={account}
                    onSettings={() => console.log("Settings opened")}
                  />
                ))}
              </div>
            </div>

            {/* Campaigns Placeholder */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Active Campaigns
              </h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
