# Engaged

Church youth enrollment and matching system. Elders and pastors enroll youth members with their details and photos, then use intelligent matching to suggest compatible pairs.

## Features

- **Youth Enrollment** - Add youth with photo, personal info, and branch church
- **Contact List View** - iOS-inspired list sorted by age with search and filters
- **Youth Profiles** - Detailed view with status management (active, matched, married, disabled)
- **Intelligent Matching** - Algorithm-based compatibility scoring with approve/decline workflow

## Tech Stack

- **Next.js** (App Router) - Frontend and API
- **Prisma + SQLite** - Database
- **Cloudflare R2** - Photo storage
- **Tailwind CSS** - Styling (mobile-first, iOS-inspired)

## Getting Started

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
