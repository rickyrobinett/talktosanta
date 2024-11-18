# Remix + Cloudflare WebRTC Application

A Remix application running on Cloudflare Pages with WebRTC support.

## Prerequisites

- Node.js >= 20.0.0
- Cloudflare account with:
  - Account ID
  - API token with TURN server permissions
- OpenAI API key with access to GPT-4 realtime preview

## Environment Variables

Create a `.dev.vars` file in the root directory with:

CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
OPENAI_API_KEY=your_openai_api_key

## Development

1. Install dependencies:

    npm install

2. Generate Cloudflare types:

    npm run typegen

3. Run the development server:

    npm run preview


## Deployment

Deploy to Cloudflare Pages:

    npm run deploy

Make sure to configure the following environment variables in your Cloudflare Pages project settings:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `OPENAI_API_KEY`

## Technology Stack

- [Remix](https://remix.run/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages)
- [Cloudflare TURN Server](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/platform/turn/)
- [OpenAI GPT-4](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Additional Notes

- After making changes to `wrangler.toml`, rerun `npm run typegen` to update TypeScript definitions
- The application uses Cloudflare's TURN server for WebRTC connectivity
- Tailwind CSS is pre-configured for styling
