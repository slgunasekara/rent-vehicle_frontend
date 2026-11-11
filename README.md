# Vehicle Buddy - Frontend

Created by **Praveena Gunasekara**.

This is the website part of Vehicle Buddy, a vehicle marketplace for Sri Lanka where people post ads to sell or rent cars, vans, bikes and more. It is a React single page app. It talks to the Vehicle Buddy API (the `backend` folder) and does nothing useful without it, so start the backend first.

## What you can do on the site

- Browse and search ads with filters (make, city, price, and so on), and switch between grid and list views
- Open an ad to see photos, owner contact buttons (call / WhatsApp), reviews, similar vehicles and a trip cost calculator
- Save ads you like, and see the ones you looked at recently
- Sign up with email or Google, and reset a forgotten password with an emailed code
- Post, edit and renew your own ads, with an optional "Write with AI" button for the description
- Make an ad a Top ad (paid, through PayHere) so it shows first
- Chat with Buddy, the built-in helper
- Use the site in English, Sinhala or Tamil, in light or dark mode
- Company console for admins: users, ads, reports, contact messages, Top ad payments and the admin team

## Built with

React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, Recharts and lucide-react icons. Google sign-in uses `@react-oauth/google`.

## Getting started

You need Node.js 18 or newer.

```bash
cd frontend
npm install
cp .env.example .env     # then fill in the values, see below
npm run dev
```

The site opens at http://localhost:5173. The dev server is also reachable from a phone on the same Wi-Fi at `http://<your-pc-ip>:5173`.

Make sure the backend is running (by default on port 5000), otherwise every page that needs data will show an error.

## Environment variables

Put these in `frontend/.env`. Only names starting with `VITE_` are visible to the browser.

| Variable | What it is |
| --- | --- |
| `VITE_API_URL` | Address of the backend API, e.g. `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google Web client ID. Leave empty to hide the Google button |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name, used to play the home page video |
| `VITE_HERO_VIDEO_URL` | Full address of a video for the home and login pages. Overrides the Cloudinary one |
| `VITE_COMPANY_EMAIL` | Company mailbox shown on the Contact page and footer. Use the same one as `COMPANY_EMAIL` in the backend |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type check with `tsc`, then build into `dist/` |
| `npm run preview` | Serve the built site locally to try it out |

## Project layout

```
frontend/
  public/          logo, favicon, Buddy image, fallback hero video
  src/
    components/    reusable pieces (auth, chat, layout, vehicle cards, filters ...)
    pages/         one folder per area: public, auth, account, admin
    router/        routes and the sign-in / admin guards
    service/       API calls (axios)
    store/         Redux slices for auth and favourites
    i18n/          English, Sinhala and Tamil text
    data/          static lists: makes and models, locations, fuel prices
    utils/         small helpers (formatting, filters, recent ads)
    context/       theme (light / dark)
  tailwind.config.ts   colour palette, fonts, animations
```

## Things you will probably want to change

- **Fuel prices** used by the trip calculator are example values in `src/data/fuelPrices.ts`. Update them when prices change.
- **Colours** (navy, brand, aqua) are in `tailwind.config.ts`.
- **Translations** live in `src/i18n/si.ts` and `src/i18n/ta.ts`. A missing key falls back to English.

## Deploying

The build output is plain static files, so any static host works. The project is set up for Vercel: `vercel.json` sends every path to `index.html` so page refreshes do not give a 404 (`public/_redirects` does the same on Netlify).

1. Set the root directory to `frontend`.
2. Add the environment variables above in the host's settings. `VITE_API_URL` must point to the deployed backend, not localhost.
3. Build command `npm run build`, output directory `dist`.

Remember that `VITE_` variables are baked in at build time, so redeploy after changing them.

## Troubleshooting

- **Blank page or network errors** - check that the backend is running and that `VITE_API_URL` is correct. Restart `npm run dev` after editing `.env`.
- **No Google button** - `VITE_GOOGLE_CLIENT_ID` is empty. That is intended.
- **Type errors in `tailwind.config.ts`** - keyframe values must be strings, so write `opacity: '0'`, not `opacity: 0`.
- **Page not found after refresh on a host** - the host is missing the rewrite to `index.html`.

## Author

Built and maintained by Praveena Gunasekara.
