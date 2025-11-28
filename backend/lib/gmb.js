// lib/gmb.js
import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

async function getAccessToken() {
  // Using service account JSON key file path from env
  const keyPath = process.env.GMB_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath || !fs.existsSync(keyPath)) {
    throw new Error("GMB service account key file missing; set GMB_SERVICE_ACCOUNT_KEY_PATH");
  }
  const auth = new GoogleAuth({
    keyFilename: keyPath,
    scopes: SCOPES
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const token = accessTokenResponse?.token || accessTokenResponse;
  if (!token) throw new Error("Unable to get GMB access token");
  return token;
}

export async function processRating({ rating = 5, comment = "Review from WhatsApp", contact_id = null, from = null }) {
  const accountId = process.env.GMB_ACCOUNT_ID;
  const locationId = process.env.GMB_LOCATION_ID;
  if (!accountId || !locationId) throw new Error("GMB_ACCOUNT_ID/GMB_LOCATION_ID missing");

  const token = await getAccessToken();

  // The GMB API doesn't provide a direct endpoint to create public reviews for locations programmatically for all accounts
  // Historically there were constraints. If your reseller/account allows creating reviews via API, you'd call it here.
  // We'll attempt to call a hypothetical endpoint following your earlier plan. If the API doesn't allow this in your GMB tier,
  // fallback would be to store it internally or send a review link to the user to publish themselves.

  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
  try {
    const resp = await axios.post(
      url,
      {
        starRating: rating === 5 ? "FIVE" : (rating === 4 ? "FOUR" : "THREE"),
        comment: comment
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return resp.data;
  } catch (err) {
    // If API doesn't allow direct creation, consider sending email or log it
    console.error("GMB API error:", err?.response?.data || err.message);
    throw err;
  }
}
