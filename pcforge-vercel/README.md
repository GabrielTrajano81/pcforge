PCForge — Vercel Ready FullStack Demo

Structure:
- frontend/  (React + Vite + Three.js placeholder)
- backend/   (Node + Express API stubs)
- vercel.json (config for Vercel deploy)

How to deploy to Vercel:
1. Go to https://vercel.com and login
2. Create a new project -> Import -> Upload
3. Upload the ZIP file (pcforge-vercel.zip)
4. Vercel will detect and deploy the frontend and backend

Notes:
- Current backend returns simulated prices. Replace fetchPricesSimulated with real integrations.
- Logs of queries are stored in backend/logs/queries.json
