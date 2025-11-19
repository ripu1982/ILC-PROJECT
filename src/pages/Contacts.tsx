import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Download, 
  Upload,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Tag as TagIcon,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tags: string[];
  channel: "whatsapp" | "facebook" | "instagram" | "google";
  consent: boolean;
  dnd: boolean;
  lastContact?: string;
  notes?: string;
  location?: string;
  vip: boolean;
  interactions: number;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    tags: ["vip", "customer"],
    channel: "whatsapp",
    consent: true,
    dnd: false,
    lastContact: "2024-01-15",
    notes: "Interested in premium features",
    location: "New York, USA",
    vip: true,
    interactions: 24
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@company.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    tags: ["lead", "enterprise"],
    channel: "facebook",
    consent: true,
    dnd: false,
    lastContact: "2024-01-14",
    location: "San Francisco, USA",
    vip: false,
    interactions: 12
  },
  {
    id: "3",
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    tags: ["customer", "support"],
    channel: "instagram",
    consent: true,
    dnd: false,
    lastContact: "2024-01-13",
    notes: "Prefers Instagram for communication",
    location: "Los Angeles, USA",
    vip: false,
    interactions: 8
  },
  {
    id: "4",
    name: "James Brown",
    phone: "+1 (555) 456-7890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    tags: ["lead"],
    channel: "google",
    consent: false,
    dnd: true,
    lastContact: "2024-01-10",
    location: "Chicago, USA",
    vip: false,
    interactions: 3
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    tags: ["vip", "customer", "partner"],
    channel: "whatsapp",
    consent: true,
    dnd: false,
    lastContact: "2024-01-15",
    notes: "Long-term partner, priority support",
    location: "Boston, USA",
    vip: true,
    interactions: 45
  }
];

const channelColors = {
  whatsapp: "bg-green-500",
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  google: "bg-red-500"
};



export default function Contacts() {
  //const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const currentPath = "/contacts";

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)));

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);
    
    const matchesChannel = filterChannel === "all" || contact.channel === filterChannel;
    
    const matchesTags = filterTags.length === 0 || 
      filterTags.every(tag => contact.tags.includes(tag));
    
    return matchesSearch && matchesChannel && matchesTags;
  });

  useEffect(() => {
  async function loadContacts() {
    try {
      const res = await fetch("http://localhost:4000/api/contacts");
      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : [])
        .map((c) => {
          // Normalize tags -> always array
          let tags: string[] = [];
          if (Array.isArray(c.tags)) tags = c.tags;
          else if (typeof c.tags === "string" && c.tags.trim() !== "") {
            try {
              tags = JSON.parse(c.tags);
              if (!Array.isArray(tags)) tags = String(c.tags).split(",").map((t: string) => t.trim());
            } catch (e) {
              // fallback: comma separated string
              tags = String(c.tags).split(",").map((t: string) => t.trim()).filter(Boolean);
            }
          }

          return {
            ...c,
            tags,
            // normalize booleans/numbers if your DB returns 0/1
            consent: Boolean(Number(c.consent)),
            dnd: Boolean(Number(c.dnd)),
            vip: Boolean(Number(c.vip)),
            interactions: Number(c.interactions || 0),
            lastContact: c.lastContact ? new Date(c.lastContact).toISOString() : "",
          };
        });

      setContacts(normalized);
    } catch (err) {
      console.error(err);
    }
  }

  loadContacts();
}, []);


  const stats = {
    total: contacts.length,
    withConsent: contacts.filter(c => c.consent).length,
    dnd: contacts.filter(c => c.dnd).length,
    vip: contacts.filter(c => c.vip).length
  };

  const handleExport = () => {
  if (contacts.length === 0) {
    toast({ title: "No Contacts", description: "Nothing to export." });
    return;
  }

  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    // escape double quotes by doubling them, and wrap field in quotes
    return `"${s.replace(/"/g, '""')}"`;
  };

  const csvHeader = [
    "id","name","email","phone","tags","channel","consent","dnd","location","notes","vip","lastContact","interactions"
  ].join(",") + "\n";

  const csvRows = contacts.map((c) => {
    // ensure tags is string (comma separated)
    let tagsStr = "";
    if (Array.isArray(c.tags)) tagsStr = c.tags.join(",");
    else if (typeof c.tags === "string") tagsStr = c.tags;
    else tagsStr = "";

    return [
      escape(c.id),
      escape(c.name),
      escape(c.email || ""),
      escape(c.phone || ""),
      escape(tagsStr),
      escape(c.channel),
      c.consent ? "1" : "0",
      c.dnd ? "1" : "0",
      escape(c.location || ""),
      escape(c.notes || ""),
      c.vip ? "1" : "0",
      escape(c.lastContact || ""),
      String(c.interactions || 0)
    ].join(",");
  }).join("\n");

  const csv = csvHeader + csvRows;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.csv";
  a.click();

  URL.revokeObjectURL(url);
};


const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Contact Deleted",
      description: "The contact has been removed.",
      variant: "destructive"
    });
  };

  const toggleTag = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return <Phone className="w-4 h-4" />;
      case "facebook": return <MessageSquare className="w-4 h-4" />;
      case "instagram": return <MessageSquare className="w-4 h-4" />;
      case "google": return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar currentPath={currentPath} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Contacts
              </h1>
              <p className="text-muted-foreground">
                Manage your contacts across all channels
              </p>
            </div>
            <div className="flex gap-2">
              <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const text = await file.text();
            const rows = text.split("\n").slice(1); // remove header row

            const parseCSV = (line: string) => {
              const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
              return line.match(regex)?.map((col) => col.replace(/^"|"$/g, "")) || [];
            };

            const newContacts = rows
              .filter((row) => row.trim() !== "")
              .map((row) => {
                const cols = parseCSV(row);

                return {
                  id: crypto.randomUUID(),
                  name: cols[1] || "",
                  email: cols[2] || "",
                  phone: cols[3] || "",
                  tags: cols[4] ? cols[4].split(",") : [],
                  channel: cols[5] || "whatsapp",
                  consent: cols[6] === "1",
                  dnd: cols[7] === "1",
                  location: cols[8] || "",
                  notes: cols[9] || "",
                  vip: cols[10] === "1",
                  lastContact: cols[11] || "",
                  interactions: parseInt(cols[12] || "0"),
                };
              });

            for (const c of newContacts) {
              await fetch("http://localhost:4000/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(c),
              });
            }

            toast({
              title: "Import Completed",
              description: "Contacts imported successfully.",
            });

            window.location.reload();
          }}

          />
              <Button onClick={handleImport} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Contacts</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">With Consent</p>
                  <p className="text-3xl font-bold">{stats.withConsent}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Do Not Disturb</p>
                  <p className="text-3xl font-bold">{stats.dnd}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">VIP Contacts</p>
                  <p className="text-3xl font-bold">{stats.vip}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filterTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {filterTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterTags([])}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Contacts List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredContacts.map(contact => (
              <Card
                key={contact.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedContact(contact);
                  setIsDetailsOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        {contact.vip && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <div className={`w-2 h-2 rounded-full ${channelColors[contact.channel]}`} />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{contact.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                      {Array.isArray(contact.tags) &&
                        contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}

                      {contact.consent && (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-500"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Consent
                        </Badge>
                      )}

                      {contact.dnd && (
                        <Badge
                          variant="outline"
                          className="text-xs border-orange-500 text-orange-500"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          DND
                        </Badge>
                      )}
                    </div>

                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Last contact: {contact.lastContact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{contact.interactions} interactions</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(contact.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No contacts found matching your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Contact Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <ScrollArea className="max-h-[70vh]">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="info" className="flex-1">Information</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback>
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedContact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedContact.vip && (
                          <Badge variant="default" className="gap-1">
                            <Star className="w-3 h-3" />
                            VIP
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {getChannelIcon(selectedContact.channel)}
                          <span className="ml-1">{selectedContact.channel}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedContact.email && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <p className="font-medium">{selectedContact.email}</p>
                      </div>
                    )}
                    {selectedContact.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium">{selectedContact.phone}</p>
                      </div>
                    )}
                    {selectedContact.location && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                        <p className="font-medium">{selectedContact.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Interactions</p>
                      <p className="font-medium">{selectedContact.interactions}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      {selectedContact.consent ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        {selectedContact.consent ? "Has Consent" : "No Consent"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedContact.dnd ? (
                        <XCircle className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      <span className="text-sm">
                        {selectedContact.dnd ? "Do Not Disturb" : "Available"}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Last contacted</p>
                        <p className="text-sm text-muted-foreground">{selectedContact.lastContact}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Full interaction history will be available in the next update
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div>
                    <Label htmlFor="contact-notes">Notes</Label>
                    <Textarea
                      id="contact-notes"
                      value={selectedContact.notes || ""}
                      readOnly
                      rows={8}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="channel">Channel *</Label>
                <Select>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" />
            </div>

            <div>
              <Label htmlFor="tags-input">Tags</Label>
              <Input id="tags-input" placeholder="customer, lead, vip (comma separated)" />
            </div>

            <div>
              <Label htmlFor="notes-input">Notes</Label>
              <Textarea id="notes-input" placeholder="Additional notes about this contact..." rows={4} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            {/*<Button onClick={() => {
              setIsAddOpen(false);
              toast({
                title: "Contact Added",
                description: "The new contact has been saved.",
              });
            }}>
              Add Contact
            </Button>*/}
            <Button
            onClick={async () => {
              const name = (document.getElementById("name") as HTMLInputElement).value;
              const email = (document.getElementById("email") as HTMLInputElement).value;
              const phone = (document.getElementById("phone") as HTMLInputElement).value;
              const location = (document.getElementById("location") as HTMLInputElement).value;
              const notes = (document.getElementById("notes-input") as HTMLTextAreaElement).value;
              const tagsInput = (document.getElementById("tags-input") as HTMLInputElement).value;
              const tags = tagsInput.split(",").map((t) => t.trim());
              const channel = "whatsapp"; // TODO: get from Select
              const consent = true;
              const dnd = false;
              const vip = false;

              const res = await fetch("http://localhost:4000/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, location, notes, tags, channel, consent, dnd, vip }),
              });

              const newContact = await res.json();
              setContacts((prev) => [newContact, ...prev]);
              setIsAddOpen(false);

              toast({ title: "Contact Added", description: "The new contact has been saved." });
            }}
          >
            Add Contact
          </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}