# Contoso Contact Center

Contoso Contact Center is a real-time operations cockpit for Contoso Bank support leaders. It tracks queue health, agent availability, live customer conversations, site performance, and emerging topics in one executive-ready dashboard.

## Highlights

- **Live operations overview** with FCR, AHT, CSAT, service level, NPS, and queue pressure indicators.
- **Call monitoring workflow** for opening a live-call detail panel with transcript state and escalation signals.
- **Agent and queue intelligence** covering availability, wrap-up status, wait time, abandonment, and workload distribution.
- **Site and topic analytics** for comparing contact center locations and spotting trends across customer conversations.
- **Branded metadata and social previews** for a polished Contoso Bank sharing experience.

## Tech stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Radix UI primitives
- Recharts and Lucide icons

## Local development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful scripts

```bash
pnpm lint
pnpm build
pnpm start
```

## Configuration

Set `NEXT_PUBLIC_SITE_URL` when the app is hosted so generated metadata and social image URLs use the production origin:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

If this variable is not set, metadata falls back to `http://localhost:3000` for local development.
