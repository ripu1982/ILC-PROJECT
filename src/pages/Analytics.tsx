import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Eye,
  BarChart3,
  Calendar,
  Download,
  Filter
} from "lucide-react";

const Analytics = () => {
  const overviewMetrics = [
    {
      title: "Total Reach",
      value: "45.2K",
      change: "+12.5%",
      changeType: "increase",
      period: "vs last month"
    },
    {
      title: "Engagement Rate",
      value: "8.4%",
      change: "+2.1%", 
      changeType: "increase",
      period: "vs last month"
    },
    {
      title: "Messages Sent",
      value: "12.4K",
      change: "+23%",
      changeType: "increase", 
      period: "vs last month"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.5%",
      changeType: "decrease",
      period: "vs last month"
    }
  ];

  const platformMetrics = [
    {
      platform: "WhatsApp",
      messages: 8200,
      delivered: 96,
      opened: 78,
      replied: 45,
      color: "text-green-600 bg-green-100"
    },
    {
      platform: "Facebook",
      messages: 2100,
      delivered: 94,
      opened: 65,
      replied: 28,
      color: "text-blue-600 bg-blue-100"
    },
    {
      platform: "Instagram", 
      messages: 1800,
      delivered: 92,
      opened: 72,
      replied: 35,
      color: "text-pink-600 bg-pink-100"
    },
    {
      platform: "Google Business",
      messages: 300,
      delivered: 98,
      opened: 82,
      replied: 52,
      color: "text-red-600 bg-red-100"
    }
  ];

  const topCampaigns = [
    {
      name: "Holiday Promotion 2024",
      type: "WhatsApp",
      sent: 10000,
      delivered: 9600,
      opened: 6800,
      clicked: 2040,
      converted: 320
    },
    {
      name: "Social Media Blast", 
      type: "Multi-platform",
      sent: 5000,
      delivered: 4700,
      opened: 3290,
      clicked: 987,
      converted: 156
    },
    {
      name: "Flash Sale Weekend",
      type: "WhatsApp",
      sent: 8500,
      delivered: 8245,
      opened: 5771,
      clicked: 1154,
      converted: 173
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/analytics" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Track performance across all your marketing channels
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 days
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.title}</p>
                          <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {metric.changeType === "increase" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span className={`text-sm ${
                              metric.changeType === "increase" ? "text-success" : "text-destructive"
                            }`}>
                              {metric.change}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {metric.period}
                            </span>
                          </div>
                        </div>
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          index === 0 ? "bg-primary/20" :
                          index === 1 ? "bg-accent/20" :
                          index === 2 ? "bg-success/20" : "bg-warning/20"
                        }`}>
                          {index === 0 && <Users className="h-6 w-6 text-primary" />}
                          {index === 1 && <Eye className="h-6 w-6 text-accent" />}
                          {index === 2 && <MessageSquare className="h-6 w-6 text-success" />}
                          {index === 3 && <TrendingUp className="h-6 w-6 text-warning" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Platform Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformMetrics.map((platform) => (
                      <div key={platform.platform} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{platform.platform}</p>
                              <p className="text-sm text-muted-foreground">
                                {platform.messages.toLocaleString()} messages sent
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="text-center">
                              <p className="font-medium">{platform.delivered}%</p>
                              <p className="text-muted-foreground">Delivered</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{platform.opened}%</p>
                              <p className="text-muted-foreground">Opened</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{platform.replied}%</p>
                              <p className="text-muted-foreground">Replied</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Delivered</span>
                              <span>{platform.delivered}%</span>
                            </div>
                            <Progress value={platform.delivered} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Opened</span>
                              <span>{platform.opened}%</span>
                            </div>
                            <Progress value={platform.opened} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Replied</span>
                              <span>{platform.replied}%</span>
                            </div>
                            <Progress value={platform.replied} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {topCampaigns.map((campaign, index) => (
                      <div key={index} className="space-y-3 p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{campaign.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {campaign.type}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Delivered</p>
                            <p className="font-medium">{campaign.delivered.toLocaleString()}</p>
                            <p className="text-xs text-success">
                              {((campaign.delivered / campaign.sent) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Opened</p>
                            <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                            <p className="text-xs text-primary">
                              {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Clicked</p>
                            <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                            <p className="text-xs text-accent">
                              {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Converted</p>
                            <p className="font-medium">{campaign.converted}</p>
                            <p className="text-xs text-warning">
                              {((campaign.converted / campaign.sent) * 100).toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Campaign Progress</span>
                            <span>{((campaign.delivered / campaign.sent) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(campaign.delivered / campaign.sent) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platformMetrics.map((platform) => (
                  <Card key={platform.platform}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded ${platform.color} flex items-center justify-center`}>
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <span>{platform.platform}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Messages Sent</p>
                          <p className="text-2xl font-bold">{platform.messages.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Rate</p>
                          <p className="text-2xl font-bold">{platform.delivered}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Open Rate</span>
                            <span>{platform.opened}%</span>
                          </div>
                          <Progress value={platform.opened} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Reply Rate</span>
                            <span>{platform.replied}%</span>
                          </div>
                          <Progress value={platform.replied} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audience" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Contacts</span>
                        <span className="font-medium">8,742</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active This Month</span>
                        <span className="font-medium">6,234</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">New This Month</span>
                        <span className="font-medium text-success">+892</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                        <span className="font-medium">2.3 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                        <span className="font-medium">4.6/5.0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Resolution Rate</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analytics;