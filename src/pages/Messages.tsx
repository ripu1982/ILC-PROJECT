// src/pages/Messages.tsx

import { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Phone, MoreHorizontal, Send, Paperclip, Facebook, Instagram } from "lucide-react";

// ----------------------------
// 🔵 Type Definitions (Fixed)
// ----------------------------
type Sender = {
  name?: string;
  email?: string;
  id?: string;
};

type Conversation = {
  id: string;
  snippet?: string;
  updated_time?: string;
  unread_count?: number;
  senders?: Sender[];
};

type MessageItem = {
  id: string;
  from?: { id?: string; name?: string };
  message?: string;
  created_time?: string;
  attachments?: unknown;    // ❗ FIXED: replaced "any" with "unknown"
};

// ----------------------------
// 🔵 ENV CONFIG (Fixes missing name)
// ----------------------------
const API_BASE = import.meta.env.VITE_API_BASE || "http://13.201.76.47";
const FACEBOOK_PAGE_ID: string =
  import.meta.env.VITE_FACEBOOK_PAGE_ID || ""; // ❗ avoids TS error

// ----------------------------

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------
  // Load conversations
  // ----------------------------
  useEffect(() => {
    loadConversations();
    const t = setInterval(() => loadConversations(), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selectedConversation) loadMessages(selectedConversation);
  }, [selectedConversation]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // ----------------------------
  // API: Conversations
  // ----------------------------
  async function loadConversations() {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${API_BASE}/facebook/conversations`);
      const json = await res.json();
      setConversations(json.data || []);

      if (!selectedConversation && json.data?.length > 0) {
        setSelectedConversation(json.data[0].id);
      }
    } catch (err) {
      console.error("loadConversations error", err);
    } finally {
      setLoadingConvs(false);
    }
  }

  // ----------------------------
  // API: Messages
  // ----------------------------
  async function loadMessages(convId: string) {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_BASE}/facebook/conversations/${convId}/messages`);
      const json = await res.json();
      setMessages(json.data || []);
    } catch (err) {
      console.error("loadMessages error", err);
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }

  // ----------------------------
  // Send Message
  // ----------------------------
  async function handleSend() {
    if (!selectedConversation || !messageInput.trim()) return;
    const text = messageInput.trim();

    setMessages(prev => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: { name: "You" },
        message: text,
        created_time: new Date().toISOString()
      }
    ]);

    setMessageInput("");

    try {
      const res = await fetch(`${API_BASE}/facebook/conversations/${selectedConversation}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const json = await res.json();

      if (!res.ok) {
        console.error("send error", json);
      } else {
        setTimeout(() => loadMessages(selectedConversation), 500);
      }
    } catch (err) {
      console.error("send exception", err);
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp": return <MessageSquare className="h-4 w-4 text-green-600" />;
      case "facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
      case "instagram": return <Instagram className="h-4 w-4 text-pink-600" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // ----------------------------
  // UI Rendering
  // ----------------------------
  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/messages" />

      <main className="flex-1 overflow-hidden">
        <div className="border-b border-border bg-card">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Messages</h1>
              <p className="text-muted-foreground mt-1">Manage conversations across all your channels</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline"><Phone className="h-4 w-4 mr-2" />Start Call</Button>
              <Button className="bg-gradient-primary hover:opacity-90"><MessageSquare className="h-4 w-4 mr-2" />New Message</Button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-80 border-r border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {loadingConvs && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}

              {!loadingConvs &&
                conversations.map(conv => {
                  const title =
                    conv.senders?.[0]?.name ||
                    conv.snippet ||
                    "Conversation";

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedConversation === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {title.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium truncate">{title}</p>
                              <Facebook className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex items-center space-x-1">
                              <p className="text-xs text-muted-foreground">
                                {new Date(conv.updated_time || "").toLocaleString()}
                              </p>
                              {conv.unread_count ? (
                                <Badge className="bg-primary text-xs px-1.5 py-0.5">
                                  {conv.unread_count}
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground truncate">{conv.snippet}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b bg-card flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">Conversation</p>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-muted-foreground">Facebook • Page Inbox</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>

                {/* Messages */}
                <div ref={messagesRef} className="flex-1 overflow-auto p-4 space-y-4">
                  {loadingMsgs && <div className="text-sm text-muted-foreground">Loading messages...</div>}

                  {!loadingMsgs &&
                    messages.map(m => {
                      const isAgent =
                        m.from?.name === "You" ||
                        (FACEBOOK_PAGE_ID && m.from?.id === FACEBOOK_PAGE_ID);

                      return (
                        <div key={m.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isAgent
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{m.message}</p>
                            <div className="flex justify-end text-xs mt-1 opacity-70">
                              {m.created_time ? new Date(m.created_time).toLocaleString() : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Input Box */}
                <div className="p-4 border-t bg-card">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4" /></Button>

                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />

                    <Button className="bg-gradient-primary" onClick={handleSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-muted-foreground">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
