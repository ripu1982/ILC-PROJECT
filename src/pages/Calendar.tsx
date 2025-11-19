import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Facebook, Instagram, Mail, MapPin, Plus, Clock } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

// Mock scheduled posts data
const scheduledPosts = [
  {
    id: 1,
    date: new Date(2025, 9, 25, 14, 30),
    platform: "facebook",
    title: "Fall Product Launch",
    content: "Excited to announce our new fall collection! 🍂",
    status: "scheduled",
  },
  {
    id: 2,
    date: new Date(2025, 9, 25, 16, 0),
    platform: "instagram",
    title: "Behind the Scenes",
    content: "Take a peek at our creative process...",
    status: "scheduled",
  },
  {
    id: 3,
    date: new Date(2025, 9, 26, 10, 0),
    platform: "whatsapp",
    title: "Campaign: Welcome Series",
    content: "Welcome to our community! Here's a special offer...",
    status: "scheduled",
  },
  {
    id: 4,
    date: new Date(2025, 9, 27, 13, 0),
    platform: "google",
    title: "Business Update",
    content: "New hours starting next week: Mon-Fri 9AM-6PM",
    status: "scheduled",
  },
  {
    id: 5,
    date: new Date(2025, 9, 28, 11, 30),
    platform: "facebook",
    title: "Weekend Special",
    content: "Limited time offer this weekend only! 🎉",
    status: "scheduled",
  },
  {
    id: 6,
    date: new Date(2025, 9, 28, 15, 0),
    platform: "instagram",
    title: "Customer Spotlight",
    content: "Featuring our amazing customers this week...",
    status: "scheduled",
  },
];

const platformIcons = {
  facebook: { icon: Facebook, color: "bg-blue-500" },
  instagram: { icon: Instagram, color: "bg-pink-500" },
  whatsapp: { icon: Mail, color: "bg-green-500" },
  google: { icon: MapPin, color: "bg-red-500" },
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 25));
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Get posts for selected date
  const postsForSelectedDate = scheduledPosts.filter((post) =>
    isSameDay(post.date, selectedDate)
  );

  // Get all dates with scheduled posts
  const datesWithPosts = scheduledPosts.map((post) => post.date);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/calendar" />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Calendar</h1>
                <p className="text-muted-foreground">
                  View and manage your scheduled posts and campaigns
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>
                      {format(selectedDate, "MMMM yyyy")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                    >
                      Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border w-full"
                  modifiers={{
                    hasPost: datesWithPosts,
                  }}
                  modifiersClassNames={{
                    hasPost: "bg-primary/10 font-bold",
                  }}
                />
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary/10 border-2 border-primary" />
                    <span>Has scheduled posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>Selected date</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Posts for Selected Date */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "MMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  {postsForSelectedDate.length} scheduled post{postsForSelectedDate.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {postsForSelectedDate.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No posts scheduled for this date
                      </p>
                      <Button variant="link" className="mt-2">
                        Schedule a post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {postsForSelectedDate
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map((post) => {
                          const platformInfo = platformIcons[post.platform as keyof typeof platformIcons];
                          const Icon = platformInfo.icon;
                          
                          return (
                            <div
                              key={post.id}
                              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`${platformInfo.color} rounded-lg p-2 flex-shrink-0`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-sm text-foreground">
                                      {post.title}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {format(post.date, "HH:mm")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                    {post.content}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {post.platform}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {post.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Posts Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upcoming This Week</CardTitle>
              <CardDescription>All scheduled posts for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledPosts
                  .slice(0, 6)
                  .map((post) => {
                    const platformInfo = platformIcons[post.platform as keyof typeof platformIcons];
                    const Icon = platformInfo.icon;
                    
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className={`${platformInfo.color} rounded-lg p-2`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {post.title}
                            </h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {post.platform}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {post.content}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-foreground">
                            {format(post.date, "MMM d")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(post.date, "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
