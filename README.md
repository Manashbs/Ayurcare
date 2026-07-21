This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploying to Vercel (recommended)

Follow these steps to publish both frontend and backend on Vercel. Vercel will handle Next.js app and API routes automatically.

- **Connect GitHub**: Ensure your Vercel account is connected to the GitHub account `Manashbs` (you indicated it's connected and uses `manashsri4@gmail.com`).
- **Push to GitHub**: Commit and push your branch (e.g., `main`) to the GitHub repo that Vercel has access to:

```bash
git add .
git commit -m "Add Vercel config and deployment docs"
git push origin main
```

- **Create Vercel Project**: In the Vercel dashboard click "New Project" → import your GitHub repo → choose the branch you pushed.

- **Set Environment Variables**: In the Vercel Project Settings → Environment Variables, add the variables from `.env.example` with their real values (copy values from your local `.env`). Important keys to add:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- SMTP_FROM_EMAIL
- SMTP_PASSWORD
- SMTP_HOST
- SMTP_PORT
- GEMINI_API_KEY, OPENAI_API_KEY, GROQ_API_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
- GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_CLIENT_ID

- **Deploy**: After adding env vars, trigger a new deploy from the Vercel dashboard or push a new commit. Vercel will run `npm run build` and deploy the app.

- **Notes**:
	- This repository is a Next.js app — frontend and serverless API routes (under `src/app/api`) are hosted together by Vercel.
	- If you also have a separate Express server (`server.js`) intended to run as a long-running server, Vercel does not run persistent servers. If `server.js` is required, consider deploying it to a separate service (e.g., Render, Railway, Heroku) or adapt endpoints to Next.js API routes.
	- Keep secrets out of the repo. Use Vercel's Environment Variables to store production secrets.

If you want, I can: (1) create a PR with these changes, (2) help you push and trigger the deploy, or (3) generate a step-by-step video/commands for configuring Vercel.
