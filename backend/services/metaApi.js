import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Example service functions for Meta Graph API
// You must obtain and manage your Page access token(s) and IG business account id(s).

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

const IG_BUSINESS_ACCOUNT_ID = process.env.IG_BUSINESS_ACCOUNT_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

export async function postToFacebookPage({ text, mediaUrls }) {
  // If only text
  const url = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/feed`;
  const params = new URLSearchParams();
  params.append("message", text);
  params.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);

  const response = await fetch(`${url}?${params.toString()}`, { method: "POST" });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(json)}`);
  }
  return json;
}

export async function fetchFacebookPageDetails() {
  const url = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}`;
  const params = new URLSearchParams();
  params.append("fields", "id,name,fan_count,about");
  params.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);

  const response = await fetch(`${url}?${params.toString()}`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(json)}`);
  }

  return {
    platform: "facebook",
    page_id: json.id,
    page_name: json.name,
    connected: true,
    last_sync: new Date().toISOString(),
    pages: 1
  };
}

/**
 * Fetch page conversations (conversations list)
 */
export async function getPageConversations({ limit = 25 } = {}) {
  const url = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/conversations`;
  const params = new URLSearchParams({
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    fields: "id,updated_time,senders,snippet,unread_count"
  });
  if (limit) params.append("limit", String(limit));

  const res = await fetch(`${url}?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook getPageConversations error: ${JSON.stringify(json)}`);
  }
  return json; // contains data array
}

/**
 * Fetch messages for a conversation/thread
 */
export async function getConversationMessages(conversationId, { limit = 50 } = {}) {
  const url = `https://graph.facebook.com/${conversationId}/messages`;
  const params = new URLSearchParams({
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    fields: "id,from,message,created_time,attachments",
    limit: String(limit),
  });
  const res = await fetch(`${url}?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook getConversationMessages error: ${JSON.stringify(json)}`);
  }
  return json;
}

/**
 * Send a reply to a conversation (using /{conversation_id}/messages endpoint)
 * NOTE: To send messages as page, your app must have pages_messaging permission and page token must allow sending.
 */
export async function sendReplyToConversation(conversationId, { messageText }) {
  const url = `https://graph.facebook.com/${conversationId}/messages`;
  const params = new URLSearchParams({
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    message: messageText
  });

  const res = await fetch(`${url}?${params.toString()}`, { method: "POST" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook sendReplyToConversation error: ${JSON.stringify(json)}`);
  }
  return json;
}


export async function postToInstagramBusiness({ text, mediaUrls }) {
  // Upload media container first
  // This is a simplified example for single image
  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error("Instagram post requires media");
  }
  const imageUrl = mediaUrls[0]; // this example only handles one image

  // Step1: Create media object
  let url1 = `https://graph.facebook.com/${IG_BUSINESS_ACCOUNT_ID}/media`;
  let body1 = new URLSearchParams();
  body1.append("image_url", imageUrl);
  body1.append("caption", text);
  body1.append("access_token", IG_ACCESS_TOKEN);

  const res1 = await fetch(`${url1}?${body1.toString()}`, { method: "POST" });
  const json1 = await res1.json();
  if (!res1.ok) {
    throw new Error(`IG create media container error: ${JSON.stringify(json1)}`);
  }
  const creationId = json1.id;

  // Step2: Publish
  let url2 = `https://graph.facebook.com/${IG_BUSINESS_ACCOUNT_ID}/media_publish`;
  let body2 = new URLSearchParams();
  body2.append("creation_id", creationId);
  body2.append("access_token", IG_ACCESS_TOKEN);

  const res2 = await fetch(`${url2}?${body2.toString()}`, { method: "POST" });
  const json2 = await res2.json();
  if (!res2.ok) {
    throw new Error(`IG publish error: ${JSON.stringify(json2)}`);
  }
  return json2;
}
