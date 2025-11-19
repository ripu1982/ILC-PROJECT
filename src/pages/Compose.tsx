// src/pages/Compose.tsx
import { useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  Video,
  Calendar,
  Send,
  Facebook,
  Instagram,
  MessageSquare,
  MapPin,
  Eye,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video" | "link";
  name?: string;
};

const Compose = () => {
  const [postText, setPostText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", accounts: ["My Business Page", "Secondary Page"] },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600", accounts: ["@mybusiness", "@secondaccount"] },
    { id: "whatsapp", name: "WhatsApp", icon: MessageSquare, color: "text-green-600", accounts: ["+1 555-0123"] },
    { id: "google", name: "Google Business", icon: MapPin, color: "text-red-600", accounts: ["My Business Location"] }
  ];

  const mediaLibrary = media.length > 0
    ? media
    : [
      { id: "ml-1", type: "image", url: "/api/placeholder/150/150", name: "holiday-promo.jpg" },
      { id: "ml-2", type: "image", url: "/api/placeholder/150/150", name: "product-shot.jpg" },
      { id: "ml-3", type: "video", url: "/api/placeholder/150/150", name: "brand-video.mp4" },
      { id: "ml-4", type: "image", url: "/api/placeholder/150/150", name: "team-photo.jpg" }
    ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // ===== Upload helpers =====
  const uploadFile = async (file: File): Promise<MediaItem> => {
    setLoadingUpload(true);
    try {
      const form = new FormData();
      form.append("file", file);

      // use relative URL so Vite proxy can forward to backend
      const res = await fetch("/api/compose/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Upload failed");
      }

      const json = await res.json();
      // json expected: { url: "/uploads/images/...", type: "image"|"video" }
      const item: MediaItem = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        url: json.url,
        type: json.type === "video" ? "video" : "image",
        name: file.name,
      };
      setMedia(prev => [item, ...prev]);
      toast({ title: "Upload successful", description: file.name });
      return item;
    } catch (err) {
      console.error("Upload error", err);
      toast({ title: "Upload failed", description: err.message || String(err), variant: "destructive" });
      throw err;
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // upload sequentially
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadFile(files[i]);
      } catch {
        /* handled in uploadFile */
      }
    }
    // clear input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImageClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = "image/*";
    fileInputRef.current.multiple = true;
    fileInputRef.current.click();
  };

  const handleAddVideoClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = "video/*";
    fileInputRef.current.multiple = true;
    fileInputRef.current.click();
  };

  const handleAddLink = () => {
    const link = window.prompt("Enter the public URL for the image/video or page link:");
    if (!link) return;
    const item: MediaItem = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      url: link,
      type: link.match(/\.(mp4|mov|webm)$/i) ? "video" : "link",
      name: link.split("/").pop() || link,
    };
    setMedia(prev => [item, ...prev]);
    toast({ title: "Link added", description: item.name });
  };

  const removeMediaItem = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  // ===== Publish helper =====
  const publish = async (opts?: { scheduled?: boolean }) => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select platforms", description: "Pick at least one platform to publish.", variant: "destructive" });
      return;
    }
    if (!postText && media.length === 0) {
      toast({ title: "Empty post", description: "Add text or media before publishing.", variant: "destructive" });
      return;
    }

    setLoadingPublish(true);
    try {
      const body = {
        text: postText,
        mediaUrls: media.map(m => m.url),
        platforms: selectedPlatforms,
        scheduleDate: opts?.scheduled ? scheduleDate || null : null,
        scheduleTime: opts?.scheduled ? scheduleTime || null : null,
      };

      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Publish failed");
      }

      // success - clear fields or optionally keep
      setPostText("");
      setMedia([]);
      setSelectedPlatforms([]);
      setScheduleDate("");
      setScheduleTime("");
      toast({ title: opts?.scheduled ? "Scheduled" : "Published", description: "Post saved and processed." });
    } catch (err) {
      console.error("Publish error", err);
      toast({ title: "Publish failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setLoadingPublish(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/compose" />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Compose</h1>
                <p className="text-muted-foreground mt-1">
                  Create and schedule posts across all your social platforms
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => toast({ title: "Preview", description: "Preview is not implemented." })}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => publish({ scheduled: false })}
                  disabled={loadingPublish}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loadingPublish ? "Publishing..." : "Publish Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Compose Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-text">Message</Label>
                    <Textarea
                      id="post-text"
                      placeholder="What's on your mind?"
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {postText.length}/2200 characters
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileInput}
                    />
                    <Button variant="outline" size="sm" onClick={handleAddImageClick} disabled={loadingUpload}>
                      <Image className="h-4 w-4 mr-2" />
                      {loadingUpload ? "Uploading..." : "Add Image"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddVideoClick} disabled={loadingUpload}>
                      <Video className="h-4 w-4 mr-2" />
                      {loadingUpload ? "Uploading..." : "Add Video"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddLink}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>

                  {/* Selected media preview */}
                  {media.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {media.map(m => (
                        <div key={m.id} className="relative rounded overflow-hidden">
                          {m.type === "video" ? (
                            <video src={m.url} controls className="w-full h-40 object-cover" />
                          ) : (
                            <img src={m.url} alt={m.name} className="w-full h-40 object-cover" />
                          )}
                          <div className="absolute top-2 right-2">
                            <Button variant="ghost" size="icon" onClick={() => removeMediaItem(m.id)}>
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={platform.id}
                            checked={selectedPlatforms.includes(platform.id)}
                            onCheckedChange={() => togglePlatform(platform.id)}
                          />
                          
                          <platform.icon className={`h-5 w-5 ${platform.color}`} />
                          <Label htmlFor={platform.id} className="font-medium">
                            {platform.name}
                          </Label>
                        </div>

                        {selectedPlatforms.includes(platform.id) && (
                          <div className="ml-8 space-y-2">
                            <p className="text-sm text-muted-foreground">Select accounts:</p>
                            <div className="flex flex-wrap gap-2">
                              {platform.accounts.map((account) => (
                                <Badge key={account} variant="secondary" className="cursor-pointer">
                                  {account}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="now" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="now">Publish Now</TabsTrigger>
                      <TabsTrigger value="scheduled">Schedule</TabsTrigger>
                    </TabsList>

                    <TabsContent value="now" className="mt-4">
                      <p className="text-muted-foreground">
                        Your post will be published immediately to selected platforms.
                      </p>
                    </TabsContent>

                    <TabsContent value="scheduled" className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-date">Date</Label>
                          <Input
                            id="schedule-date"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-time">Time</Label>
                          <Input
                            id="schedule-time"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => publish({ scheduled: true })} disabled={loadingPublish}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {loadingPublish ? "Scheduling..." : "Schedule Post"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Media Library */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Media Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {mediaLibrary.map((mediaItem) => (
                      <div
                        key={mediaItem.id}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => {
                          // add to selection if clicking an item from library
                          if (!media.find(m => m.url === mediaItem.url)) {
                            const item: MediaItem = {
                              id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
                              url: mediaItem.url,
                              type: mediaItem.type as MediaItem["type"],
                              name: mediaItem.name,
                            };
                            setMedia(prev => [item, ...prev]);
                          }
                        }}
                      >
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.name}
                          className="w-full h-full object-cover"
                        />
                        {mediaItem.type === "video" && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => fileInputRef.current?.click()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </CardContent>
              </Card>

              {/* Post Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {postText || "Your post content will appear here..."}
                    </p>

                    {selectedPlatforms.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Publishing to:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPlatforms.map((platformId) => {
                            const platform = platforms.find(p => p.id === platformId);
                            return platform ? (
                              <Badge key={platformId} variant="secondary" className="text-xs">
                                
                                <platform.icon className={`h-3 w-3 mr-1 ${platform.color}`} />
                                {platform.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts (faux for now) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-3 text-sm">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Facebook className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">Holiday promotion post</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Compose;
