import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Play, 
  Pause, 
  MoreHorizontal,
  MessageSquare,
  Users,
  Eye,
  Calendar,
  Target
} from "lucide-react";

const Campaigns = () => {
  const [campaigns] = useState([
    {
      id: "1",
      name: "Holiday Promotion 2024",
      type: "whatsapp",
      status: "active",
      progress: 72,
      sent: 7200,
      total: 10000,
      deliveryRate: 96,
      openRate: 68,
      createdAt: "Dec 1, 2024",
      scheduledFor: null
    },
    {
      id: "2",
      name: "Social Media Blast",
      type: "social",
      status: "completed",
      progress: 100,
      sent: 5000,
      total: 5000,
      deliveryRate: 94,
      openRate: 72,
      createdAt: "Nov 28, 2024",
      scheduledFor: null
    },
    {
      id: "3",
      name: "Weekend Flash Sale",
      type: "mixed",
      status: "scheduled",
      progress: 0,
      sent: 0,
      total: 8500,
      deliveryRate: 0,
      openRate: 0,
      createdAt: "Dec 5, 2024",
      scheduledFor: "Dec 15, 2024 at 9:00 AM"
    },
    {
      id: "4",
      name: "Customer Feedback Survey",
      type: "whatsapp",
      status: "paused",
      progress: 45,
      sent: 2250,
      total: 5000,
      deliveryRate: 98,
      openRate: 65,
      createdAt: "Nov 30, 2024",
      scheduledFor: null
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "scheduled": return "bg-warning text-warning-foreground";
      case "paused": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageSquare className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "mixed": return <Target className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/campaigns" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your marketing campaigns and track performance
                </p>
              </div>
              <Button className="flex items-center space-x-2 bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold text-foreground">2</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                    <Play className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Sent</p>
                    <p className="text-2xl font-bold text-foreground">14.4K</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Delivery Rate</p>
                    <p className="text-2xl font-bold text-foreground">96%</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-foreground">68%</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              {getTypeIcon(campaign.type)}
                              <span className="text-sm capitalize">{campaign.type}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created: {campaign.createdAt}
                            {campaign.scheduledFor && (
                              <span className="ml-4 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Scheduled: {campaign.scheduledFor}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {campaign.sent.toLocaleString()} / {campaign.total.toLocaleString()} messages
                            </span>
                          </div>
                          <Progress value={campaign.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-medium">{(campaign.total - campaign.sent).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Delivery Rate</p>
                            <p className="font-medium">{campaign.deliveryRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="font-medium">{campaign.openRate}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {campaign.status === "active" && (
                            <Button variant="outline" size="sm">
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          {campaign.status === "paused" && (
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;