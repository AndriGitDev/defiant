# Instructions for AI Agents

Welcome, AI Agent! This project is a Next.js application for visualizing CVE data. Here are some tips and instructions for working with this codebase.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **3D**: Three.js, React Three Fiber, React Three Drei
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Styling**: Tailwind CSS
- **API**: Axios for fetching from NVD and EUVD

## Key Concepts
- **Unified API**: `lib/vulnerabilityApi.ts` provides a unified interface for fetching from both NVD and EUVD.
- **Caching**: API routes in `app/api/` handle caching of results in the PostgreSQL database using Drizzle ORM. This is crucial for staying within API rate limits.
- **3D Environment**: The main visualization is in `components/Visualizer3D.tsx` (if it exists, let me check).

## Guidelines
- **Maintain Aesthetic**: Keep the cyberpunk theme (colors, glitch effects) when adding new UI elements.
- **Rate Limiting**: Always respect rate limits when adding new API calls. Use the existing `waitForRateLimit` utility in API routes.
- **Types**: Use the types defined in `lib/types.ts` for consistency.
- **Database**: When changing the schema in `lib/db/schema.ts`, remember to run `npm run db:generate`.

## Project Structure
- `app/api/`: Server-side API routes for NVD and EUVD.
- `lib/db/`: Database schema and utility functions.
- `components/`: UI components, including both 2D panels and 3D elements.
- `lib/nvdApi.ts` & `lib/euvdApi.ts`: Data fetching and mapping logic.

## Verification
- Run `npm run lint` to check for code style issues.
- Run `npm run build` to ensure the project compiles correctly.
- If possible, verify API connectivity if you have the required environment variables.
