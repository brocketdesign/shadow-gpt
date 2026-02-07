# Zenith AI - Habit Tracker

🌐 **[ZenithAI.me](https://zenithai.me)**

A modern, full-featured habit tracking application built with Next.js 14, TypeScript, and Tailwind CSS. Track your daily routines with the **SAVERS** methodology, monitor your vices, manage personal challenges, and create custom trackers.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748)

## ✨ Features

### 📅 Daily Tracking (SAVERS Methodology)
- **S**ilence (Meditation)
- **A**ffirmations
- **V**isualization
- **E**xercise
- **R**eading
- **S**cribing (Journaling)

### 🚫 Vice Tracking
- Monitor alcohol consumption
- Track tobacco/cannabis use
- Record social media & screen time
- Junk food monitoring

### 🎯 Personal Challenges
- Create 30/60/90-day challenges
- AI-powered challenge descriptions
- Daily check-in system
- Progress tracking with visual indicators

### 📊 Custom Trackers
- Create unlimited custom trackers
- Track expenses, habits, or any metric
- Monthly summaries and statistics
- Filterable entry lists

### 🔥 Streaks & Motivation
- Real-time streak tracking
- Daily AI-generated affirmations
- Visual calendar with color-coded progress

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Vercel Postgres)
- OpenAI API key (optional, for AI features)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd zenith-ai
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/zenith_ai"
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
   OPENAI_API_KEY="sk-your-openai-api-key"
   ```

3. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Deploying to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Manual Deployment

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   
   In your Vercel project settings, add these environment variables:
   
   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `JWT_SECRET` | A secure random string (32+ characters) |
   | `OPENAI_API_KEY` | Your OpenAI API key (optional) |

4. **Set up Vercel Postgres (Recommended)**
   - In Vercel Dashboard, go to Storage → Create → Postgres
   - Connect it to your project
   - The `DATABASE_URL` will be automatically configured

5. **Initialize Database Schema**
   
   After first deployment, run:
   ```bash
   npx vercel env pull .env.local
   npx prisma db push
   ```
   
   Or use the Vercel CLI:
   ```bash
   vercel build
   ```

## 📁 Project Structure

```
zenith-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── affirmations/  # AI affirmations
│   │   ├── auth/          # Authentication
│   │   ├── challenges/    # Challenge management
│   │   ├── streaks/       # Streak calculations
│   │   ├── trackers/      # Custom trackers
│   │   └── tracking/      # Daily tracking
│   ├── challenges/        # Challenges page
│   ├── trackers/          # Trackers dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── providers/         # React context providers
│   ├── ui/                # Reusable UI components
│   └── *.tsx              # Feature components
├── lib/                   # Utilities and services
│   ├── auth.ts            # Authentication logic
│   ├── openai.ts          # OpenAI integration
│   ├── prisma.ts          # Prisma client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## 🔐 Authentication

The app uses JWT-based authentication:
- Tokens are stored in HTTP-only cookies
- 30-day session duration
- Automatic token refresh on activity

## 🎨 UI Components

Built with a custom component library using:
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icons

## 🗃️ Database Schema

### Models

- **User** - Authentication and profile
- **Session** - JWT session management
- **DailyTracking** - SAVERS and vices data
- **Challenge** - Personal challenges
- **ChallengeCheckIn** - Daily check-ins
- **CustomTracker** - User-defined trackers
- **CustomTrackerEntry** - Tracker entries
- **AffirmationCache** - Cached AI affirmations

## 🛠️ Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npx prisma studio # Open Prisma database viewer
```

## 🔧 Configuration

### SAVERS Items

Edit `lib/types.ts` to customize tracking items:

```typescript
export const SAVERS_CONFIG: SAVERSConfig = {
  silence: { label: "Silence (Méditation)", icon: "🧘", color: "#8B5CF6" },
  affirmations: { label: "Affirmations", icon: "💬", color: "#EC4899" },
  // ... customize as needed
}
```

### Vices

```typescript
export const VICES_CONFIG: VICESConfig = {
  alcohol: { label: "Alcool", icon: "🍺", color: "#EF4444" },
  // ... add or remove as needed
}
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS — [ZenithAI.me](https://zenithai.me)
