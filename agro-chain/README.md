# Agro-chain


## File Structure

my-app/
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── src/
│   ├── app/                     # App Router
│   │   ├── (marketing)/         # Route groups
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/                 # Route handlers
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Design system components
│   │   ├── layout/              # Navbar, Sidebar, Footer
│   │   └── shared/              # Shared cross-feature components
│   │
│   ├── features/                # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── actions.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services.ts
│   │   │   └── types.ts
│   │
│   ├── lib/                     # Utilities & server logic
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations/
│   │
│   ├── hooks/                   # Global reusable hooks
│   │   └── use-debounce.ts
│   │
│   ├── types/                   # Global TypeScript types
│   │   └── index.ts
│   │
│   ├── config/                  # App config
│   │   └── site.ts
│   │
│   └── styles/                  # Optional separated styles
│       └── tailwind.css
│
├── .env.local
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml