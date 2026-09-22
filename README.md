# Rosy Boutique VA

Rosy Boutique is a Next.js 16 App Router storefront for a Virginia boutique. The current storefront POC is preserved while the production architecture is introduced incrementally.

## Current architecture

- Public routes: `/`, `/shop`, and `/products/[slug]`.
- Existing local catalog and cart are preserved in `lib/products.ts` and `components/` while Supabase is connected.
- Supabase SSR helpers live in `lib/supabase/` and use only environment variables.
- `/admin/login` provides Supabase email/password sign-in.
- `/admin` is protected by `proxy.ts`, the server page check, and the `staff_profiles` RLS policy.
- The initial schema and RLS policies are in `supabase/migrations/20260922000000_initial_schema.sql`.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key from the Supabase dashboard.
3. Run the migration in the Supabase SQL editor or with the Supabase CLI.
4. Create an Auth user, then insert that user into `public.staff_profiles` as `owner` or `admin`.
5. Start the app with `npm run dev`.

The current first admin pass supports sign-in, database-backed product listing, and mobile-friendly product creation. Image upload, edit/archive actions, and database-backed public product queries are the next implementation slice.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize the existing display and body type families.

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
