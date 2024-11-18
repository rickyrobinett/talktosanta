import { json } from "@remix-run/cloudflare";
import type { LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request, context }) => {
  const CLOUDFLARE_ACCOUNT_ID = context.cloudflare.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_API_TOKEN = context.cloudflare.env.CLOUDFLARE_API_TOKEN;

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing required environment variables');
  }

  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${CLOUDFLARE_ACCOUNT_ID}/credentials/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ttl: 86400 // 24 hours in seconds
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get TURN credentials: ${response.statusText}`);
    }

    const credentials = await response.json();
    return json(credentials);
  } catch (error) {
    console.error('Error getting TURN credentials:', error);
    return json({ error: 'Failed to get TURN credentials' }, { status: 500 });
  }
}; 