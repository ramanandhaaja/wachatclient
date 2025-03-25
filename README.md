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

## Dual Database Setup

This project uses two databases:
1. **Local PostgreSQL** (via Prisma) - For authentication and user data
2. **Supabase** (via Supabase SDK) - For real-time chat data

For detailed setup instructions, see:
- [DUAL_DATABASE_SETUP.md](./DUAL_DATABASE_SETUP.md) - Overview of the dual-database architecture
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Instructions for setting up Supabase tables

To generate both Prisma clients, run:

```bash
./generate-prisma-clients.sh
```

## Authentication with NextAuth.js

This project uses [NextAuth.js](https://next-auth.js.org/) for authentication. To set up authentication, you need to create a `.env.local` file in the root of your project with the following environment variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/boilerplatefinal"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers (Optional)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

To generate a secure NEXTAUTH_SECRET, you can use the following command:

```bash
openssl rand -base64 32
```

## Seeding the Database

To seed the database with initial data, run:

```bash
npx prisma db seed
```

This will create an admin user with the following credentials:
- Email: admin@example.com
- Password: password123

It will also create sample conversations and messages for testing.

## API Routes

The application provides the following API routes:

### Authentication
- `/api/auth/*` - NextAuth.js routes for authentication

### Chat
- `/api/conversations` - GET: Fetch all conversations, POST: Create a new conversation
- `/api/conversations/[id]/messages` - GET: Fetch messages for a conversation, POST: Create a new message
- `/api/whatsapp` - GET: Get WhatsApp status, POST: Initialize WhatsApp
- `/api/whatsapp/send` - POST: Send a WhatsApp message
- `/api/whatsapp/takeover` - POST: Take over a conversation (admin or bot)

## React Hooks

Custom hooks are provided to interact with the API:

- `useWhatsAppStatus()` - Get WhatsApp connection status
- `useInitializeWhatsApp()` - Initialize WhatsApp connection
- `useConversations()` - Fetch all conversations
- `useCreateConversation()` - Create a new conversation
- `useMessages(conversationId)` - Fetch messages for a conversation
- `useSendMessage()` - Send a message
- `useTakeover()` - Take over a conversation (admin or bot)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
