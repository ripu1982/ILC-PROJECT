import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Search, Image, Video, File, X, Download, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: string;
  uploadedAt: string;
  tags: string[];
  dimensions?: string;
}

const mockMedia: MediaAsset[] = [
  {
    id: "1",
    name: "product-hero.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
    tags: ["product", "hero", "marketing"],
    dimensions: "1920x1080"
  },
  {
    id: "2",
    name: "team-photo.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
    size: "3.1 MB",
    uploadedAt: "2024-01-14",
    tags: ["team", "about"],
    dimensions: "1600x900"
  },
  {
    id: "3",
    name: "promo-video.mp4",
    type: "video",
    url: "",
    size: "45.2 MB",
    uploadedAt: "2024-01-13",
    tags: ["video", "promo", "campaign"],
    dimensions: "1920x1080"
  },
  {
    id: "4",
    name: "office-space.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    size: "1.8 MB",
    uploadedAt: "2024-01-12",
    tags: ["office", "workspace"],
    dimensions: "1920x1280"
  },
  {
    id: "5",
    name: "social-post-1.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
    size: "1.2 MB",
    uploadedAt: "2024-01-11",
    tags: ["social", "instagram"],
    dimensions: "1080x1080"
  },
  {
    id: "6",
    name: "presentation.pdf",
    type: "document",
    url: "",
    size: "5.6 MB",
    uploadedAt: "2024-01-10",
    tags: ["document", "presentation"]
  }
];

export default function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentPath = "/media";

  //const allTags = Array.from(new Set(mockMedia.flatMap(m => m.tags)));
  const allTags = Array.from(new Set(media.flatMap(m => m.tags)));

  const filteredMedia = media.filter(media => {
    const matchesSearch = media.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         media.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => media.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files?.length) return;

  const formData = new FormData();
  formData.append("file", files[0]);
  formData.append("tags", JSON.stringify(["uploaded"]));

  try {
    const res = await fetch("http://13.201.76.47/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    toast({ title: "Uploaded!", description: data.message });

    // ✅ refresh media after upload
    const refresh = await fetch("http://13.201.76.47/api/media");
    const updated = await refresh.json();
    setMedia(
      updated.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        url: `http://13.201.76.47${m.url}`,
        size: m.size,
        uploadedAt: m.uploadedAt,
        tags: Array.isArray(m.tags) ? m.tags : JSON.parse(m.tags || "[]"),
      }))
    );
  } catch (err) {
    toast({
      title: "Upload Error",
      description: String(err),
      variant: "destructive",
    });
  }
};



  const handleDelete = (id: string) => {
    toast({
      title: "Asset Deleted",
      description: "The media asset has been removed from your library.",
      variant: "destructive"
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  useEffect(() => {
  const fetchMedia = async () => {
    try {
      const res = await fetch("http://13.201.76.47/api/media");
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setMedia(
        data.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          url: `http://13.201.76.47${m.url}`, // ✅ full URL
          size: m.size,
          uploadedAt: m.uploadedAt,
          tags: Array.isArray(m.tags) ? m.tags : JSON.parse(m.tags || "[]"),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchMedia();
}, []);


  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar currentPath={currentPath} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Media Library
            </h1>
            <p className="text-muted-foreground">
              Manage your images, videos, and documents in one place
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6 p-8 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">Drop files to upload</h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => document.getElementById("mediaUpload")?.click()}>
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
              <input id="mediaUpload" type="file" className="hidden" onChange={handleUpload} />

              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, GIF, MP4, MOV, PDF (Max 50MB)
              </p>
            </div>
          </Card>

          {/* Search & Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 flex gap-4 text-sm text-muted-foreground">
            <span>{filteredMedia.length} assets</span>
            <span>•</span>
            <span>{mockMedia.filter(m => m.type === "image").length} images</span>
            <span>•</span>
            <span>{mockMedia.filter(m => m.type === "video").length} videos</span>
            <span>•</span>
            <span>{mockMedia.filter(m => m.type === "document").length} documents</span>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map(asset => (
              <Card
                key={asset.id}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="aspect-video bg-muted/50 relative overflow-hidden">
                  {asset.type === "image" && asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getIcon(asset.type)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate mb-1">{asset.name}</h4>
                      <p className="text-xs text-muted-foreground">{asset.size}</p>
                    </div>
                    {getIcon(asset.type)}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{asset.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {asset.uploadedAt}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No media found matching your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4">
              {selectedAsset?.type === "image" && selectedAsset.url && (
                <div className="rounded-lg overflow-hidden bg-muted/50">
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">File Size</p>
                  <p className="font-medium">{selectedAsset?.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedAsset?.type}</p>
                </div>
                {selectedAsset?.dimensions && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                    <p className="font-medium">{selectedAsset.dimensions}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Uploaded</p>
                  <p className="font-medium">{selectedAsset?.uploadedAt}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAsset?.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => {
                    if (selectedAsset) handleDelete(selectedAsset.id);
                    setSelectedAsset(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}