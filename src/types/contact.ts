export interface Contact {
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
