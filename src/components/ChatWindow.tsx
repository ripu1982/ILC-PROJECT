// components/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button"; // adjust imports to your UI library
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { Contact } from "@/types/contact";


const SOCKET_URL = "http://13.201.76.47";

interface ChatMessage {
  from: "admin" | "user";
  message: string;
  created_at: string;
}


interface Props {
  contact: Contact;          // strongly typed
  onClose: () => void;
}

export default function ChatWindow({ contact, onClose }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      s.emit("join_contact", contact.id);
    });

    s.on("message_received", (payload: { contact_id: string; text: string; created_at: string }) => {
  if (payload.contact_id === contact.id) {
    setMessages((m) => [
      ...m,
      { from: "user", message: payload.text, created_at: payload.created_at }
    ]);
  }
});

s.on("message_sent", (payload: { contact_id: string; message: string; created_at: string }) => {
  if (payload.contact_id === contact.id) {
    setMessages((m) => [
      ...m,
      { from: "admin", message: payload.message, created_at: payload.created_at }
    ]);
  }
});


    s.on("message_sent", (payload) => {
      if (payload.contact_id === contact.id) {
        setMessages((m) => [...m, { from: "admin", message: payload.message, created_at: payload.created_at }]);
      }
    });

    // optionally load recent messages from backend
    (async () => {
      const res = await fetch(`http://13.201.76.47/api/messages?contact_id=${contact.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data || []);
      }
    })();

    return () => {
      s.emit("leave_contact", contact.id);
      s.disconnect();
    };
  }, [contact.id]);

  useEffect(() => {
    msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    // send to backend
    const payload = {
      to: (contact.phone || "").replace(/\D/g, ""),
      message: text,
      contact_id: contact.id
    };

    try {
      await fetch("http://13.201.76.47/api/waba/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // optimistic UI
      setMessages((m) => [...m, { from: "admin", message: text, created_at: new Date().toISOString() }]);
      setText("");
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const askForReview = async () => {
    const reviewTemplate = `Hi ${contact.name || ""}! Would you mind rating our service from 1 (bad) to 5 (excellent)? Reply with just the number.`;
    setText(reviewTemplate);
  };

  return (
    <div className="w-full max-w-2xl h-[70vh] bg-white rounded shadow p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chat with {contact.name}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={askForReview}>Ask for Review</Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2" ref={msgRef}>
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === "admin" ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-2 rounded ${m.from === "admin" ? "bg-primary/10" : "bg-muted/20"}`}>
              <div className="text-sm">{m.message}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message..." />
        <Button onClick={sendMessage}><MessageSquare className="w-4 h-4 mr-1" />Send</Button>
      </div>
    </div>
  );
}
