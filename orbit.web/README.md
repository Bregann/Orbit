# Orbit Web

> Modern personal finance management application built with Next.js, TypeScript, and Mantine UI

The frontend web application for Orbit - a comprehensive personal finance tracker that helps you manage transactions, budgets, savings, and gain insights into your spending habits.

---

## 🚀 Features

### 💰 Finance Management
- **Dashboard**: Real-time overview of your financial health
- **Transactions**: Track and categorize all your spending
- **Budget Pots**: Organize spending into customizable categories
- **Savings Pots**: Set and track savings goals
- **Subscriptions**: Monitor recurring payments
- **Historic Data**: Analyze spending patterns over time with detailed charts

### 📊 Analytics & Insights
- Monthly spending breakdowns by category
- Top merchants and transaction analysis
- Daily spending trends
- Year-on-year comparisons (12-month trends)
- Interactive charts powered by Recharts

### 📝 Productivity
- **Journal**: Track daily thoughts and moods
- **Notes**: Rich text editor with folders and organization
- **Tasks**: Todo list with priorities and categories
- **Calendar**: Event management with recurring events
- **Shopping Lists**: Organize shopping with quick-add items

### 📄 Documents
- Upload and categorize important documents
- Full-text search capabilities
- Category-based organization

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Mantine v8](https://mantine.dev/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Charts**: [Mantine Charts](https://mantine.dev/charts/getting-started/) (Recharts)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)
- **Date Handling**: [Day.js](https://day.js.org/)
- **Styling**: [PostCSS](https://postcss.org/) with CSS Modules

---

## 📁 Project Structure

```
orbit.web/
├── app/                          # Next.js App Router
│   ├── finance/                  # Finance pages
│   │   ├── historic-data/        # Historic analytics
│   │   ├── management/           # Pots & subscriptions
│   │   └── this-month/           # Current month overview
│   ├── calendar/                 # Calendar events
│   ├── documents/                # Document management
│   ├── journal/                  # Journal entries
│   ├── notes/                    # Note taking
│   ├── shopping/                 # Shopping lists
│   ├── tasks/                    # Task management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage/dashboard
│   └── providers.tsx             # React Query provider
│
├── components/                   # React components
│   ├── cards/                    # Reusable card components
│   ├── calendars/                # Calendar-specific components
│   ├── common/                   # Shared components
│   ├── documents/                # Document components
│   ├── finance/                  # Finance components
│   │   ├── historic-data/        # Historic analytics components
│   │   └── this-month/           # Current month components
│   ├── journal/                  # Journal components
│   ├── management/               # Settings/management
│   ├── notes/                    # Notes components
│   ├── shopping/                 # Shopping components
│   ├── tasks/                    # Task components
│   └── pages/                    # Page-level components
│
├── context/                      # React context providers
├── css/                          # Global styles
├── helpers/                      # Utility functions
│   ├── mutations/                # Custom React Query mutation hooks
│   ├── apiClient.ts              # API client wrapper
│   └── notificationHelper.ts     # Toast notifications
│
├── interfaces/                   # TypeScript interfaces
│   └── api/                      # API DTOs
│       ├── calendar/
│       ├── documents/
│       ├── historicData/
│       ├── journal/
│       ├── notes/
│       ├── pots/
│       ├── shopping/
│       ├── stats/
│       ├── subscriptions/
│       ├── tasks/
│       └── transactions/
│
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm/yarn/pnpm**: Latest version
- **Orbit API**: Backend must be running (see main README)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure environment** (if needed):
   Create a `.env.local` file if you need to customize the API endpoint:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Run development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues automatically
```

---

## 🏗️ Architecture Patterns

### Data Fetching Strategy

- **Server-Side Prefetching**: Initial data loaded via Next.js server components
- **Client-Side Queries**: React Query handles client-side data fetching and caching
- **No Prop Drilling**: Components fetch their own data using custom hooks
- **Optimistic Updates**: UI updates immediately with rollback on error

### Component Structure

- **Small, Focused Components**: Each component has a single responsibility
- **Composition Over Configuration**: Build complex UIs from simple pieces
- **Type Safety**: Full TypeScript coverage with strict types
- **Reusable Hooks**: Custom React Query hooks for common patterns

### State Management

- **Server State**: TanStack Query (React Query)
- **UI State**: React hooks (useState, useReducer)
- **Form State**: Mantine form hooks
- **Global State**: React Context (minimal usage)

---

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach, works on all screen sizes
- **Dark Mode Support**: Automatic theme switching
- **Loading States**: Skeletons and spinners for better UX
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Non-intrusive feedback
- **Keyboard Navigation**: Full accessibility support

---

## 🔌 API Integration

The frontend communicates with the Orbit.Core API using:

- **REST API**: Standard HTTP requests
- **Type-Safe DTOs**: Matching C# backend models
- **Custom API Client**: Wrapper with error handling
- **Query Invalidation**: Automatic cache updates

Example API call pattern:
```typescript
const { data } = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => await doQueryGet<GetTasksResponse>('/api/tasks/GetTasks')
})
```

---

## 📊 Charts & Visualizations

Powered by Mantine Charts (Recharts), featuring:

- **Line Charts**: Trend analysis over time
- **Bar Charts**: Category comparisons
- **Area Charts**: Cumulative data visualization
- **Donut Charts**: Percentage breakdowns
- **Stacked Charts**: Multi-category comparisons

---

## 🧪 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Type Safety**: No `any` types in production code
- **Consistent Patterns**: Follow established conventions

---

### Environment Variables

Ensure these are set in production:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint

---

## 📝 Contributing

1. Follow the existing code patterns
2. Use TypeScript strictly
3. Keep components small and focused
4. Write meaningful commit messages
5. Test thoroughly before committing

---

## 🔗 Related

- **Backend API**: See `Orbit.Core` project
- **Main Documentation**: See root README.md

---

**Built with ❤️ using Next.js and Mantine**
