# Orbit

> A comprehensive personal finance management application built with .NET and Next.js

Orbit is a full-stack finance tracker that helps you manage transactions, budgets, savings, and gain deep insights into your spending habits through powerful analytics and visualizations.

---

## ✨ Features

### 💰 Finance Management
- **Open Banking Integration**: Automatic transaction imports via GoCardless and Monzo APIs
- **Transaction Management**: Categorize and organize all your spending
- **Budget Pots**: Create customizable spending categories with limits
- **Savings Pots**: Set and track savings goals with progress monitoring
- **Subscription Tracking**: Monitor recurring payments and billing cycles
- **Historic Analytics**: Detailed spending analysis with 12-month trends

### 📊 Analytics & Insights
- Monthly spending breakdowns by category
- Top merchants and transaction analysis
- Daily spending patterns
- Year-on-year comparisons
- Interactive charts and visualizations

### 📝 Productivity Suite
- **Journal**: Daily entries with mood tracking
- **Notes**: Rich text editor with folder organization
- **Tasks**: Todo management with priorities and categories
- **Calendar**: Event scheduling with recurring event support
- **Shopping Lists**: Organize shopping with quick-add common items

### 📄 Document Management
- Upload and categorize important documents
- Full-text search capabilities
- Secure storage and retrieval

---

## 🏗️ Architecture

### Tech Stack

**Backend (Orbit.Core & Orbit.Domain)**
- **Framework**: .NET 10
- **Language**: C# 13
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Entity Framework Core 10
- **API**: RESTful with JWT authentication
- **Background Jobs**: Hangfire for scheduled tasks
- **Logging**: Serilog with Seq integration

**Frontend (orbit.web)**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: Mantine v8
- **State**: TanStack Query (React Query)
- **Charts**: Recharts via Mantine Charts

---

## 📁 Project Structure

```
Orbit/
├── .github/workflows/           # CI/CD pipelines
├── Orbit.Core/                  # API Layer
│   ├── Controllers/             # API endpoints
│   │   ├── AuthController.cs
│   │   ├── TransactionsController.cs
│   │   ├── PotsController.cs
│   │   ├── HistoricMonthController.cs
│   │   ├── CalendarController.cs
│   │   ├── DocumentsController.cs
│   │   ├── JournalController.cs
│   │   ├── NotesController.cs
│   │   ├── ShoppingController.cs
│   │   └── TasksController.cs
│   ├── Properties/
│   ├── Program.cs               # Application entry point
│   ├── appsettings.json         # Configuration
│   └── Dockerfile
│
├── Orbit.Domain/                # Business Logic Layer
│   ├── Database/
│   │   ├── Context/
│   │   │   └── AppDbContext.cs  # EF Core DbContext
│   │   ├── Migrations/          # Database migrations
│   │   └── Models/              # Entity models
│   │       ├── Transactions.cs
│   │       ├── SpendingPot.cs
│   │       ├── SavingsPot.cs
│   │       ├── HistoricData.cs
│   │       ├── CalendarEvent.cs
│   │       ├── Document.cs
│   │       ├── JournalEntry.cs
│   │       ├── NotePage.cs
│   │       ├── ShoppingListItem.cs
│   │       └── TaskItem.cs
│   │
│   ├── DTOs/                    # Data Transfer Objects
│   │   ├── Auth/
│   │   ├── Calendar/
│   │   ├── Documents/
│   │   ├── Finance/
│   │   │   ├── HistoricData/
│   │   │   ├── Pots/
│   │   │   ├── Subscriptions/
│   │   │   └── Transactions/
│   │   ├── Journal/
│   │   ├── Notes/
│   │   ├── Shopping/
│   │   └── Tasks/
│   │
│   ├── Services/                # Business logic implementation
│   │   ├── AuthService.cs
│   │   ├── Finance/
│   │   │   ├── TransactionsService.cs
│   │   │   ├── PotsService.cs
│   │   │   ├── SubscriptionsService.cs
│   │   │   ├── HistoricDataService.cs
│   │   │   └── MonthService.cs
│   │   ├── Calendar/
│   │   │   └── CalendarService.cs
│   │   ├── Documents/
│   │   │   └── DocumentsService.cs
│   │   ├── Journal/
│   │   │   └── JournalService.cs
│   │   ├── Notes/
│   │   │   └── NotesService.cs
│   │   ├── Shopping/
│   │   │   └── ShoppingService.cs
│   │   └── Tasks/
│   │       └── TasksService.cs
│   │
│   ├── Interfaces/              # Service contracts
│   │   └── Api/                 # API service interfaces
│   │
│   ├── Helpers/                 # Utility classes
│   │   ├── BankApiHelper.cs     # Bank API integration
│   │   ├── CommsSenderClient.cs # Email/notifications
│   │   ├── DatabaseSeedHelper.cs
│   │   ├── EnvironmentalSettingHelper.cs
│   │   ├── HangfireJobSetup.cs
│   │   └── UserContextHelper.cs
│   │
│   └── Enums/                   # Shared enumerations
│
├── orbit.web/                   # Frontend Next.js application
│   └── (See orbit.web/README.md for details)
│
└── Orbit.sln                    # Solution file
```

---

## 🚀 Getting Started

### Prerequisites

- **.NET 10 SDK** or later
- **Node.js 20** or later
- **PostgreSQL 15+** (for production)
- **Docker**

### Database Providers

- **Development**: TestContainers (Docker required)
- **Production**: PostgreSQL (scalable, production-ready)

The provider is automatically selected based on the environment.
---

## 🔐 Authentication

JWT-based authentication with the following endpoints:

- `POST /api/Auth/Login` - Authenticate user
- `POST /api/Auth/Register` - Create new account
- `POST /api/Auth/RefreshToken` - Refresh access token

All API endpoints (except auth) require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 📡 API Documentation

### Key Endpoints

**Finance**
- `GET /api/Transactions/GetTransactionsForMonth` - Monthly transactions
- `GET /api/Pots/GetAllPotData` - Budget and savings pots
- `GET /api/HistoricMonth/GetHistoricMonthData` - Historic analytics
- `GET /api/Subscriptions/GetSubscriptions` - Recurring payments

**Productivity**
- `GET /api/Tasks/GetTasks` - Task list
- `GET /api/Calendar/GetCalendarEvents` - Calendar events
- `GET /api/Journal/GetJournalEntries` - Journal entries
- `GET /api/Notes/GetNotePagesAndFolders` - Notes structure
- `GET /api/Shopping/GetShoppingListItems` - Shopping list

**Documents**
- `GET /api/Documents/GetAllDocuments` - Document list
- `POST /api/Documents/UploadDocument` - Upload file
- `GET /api/Documents/DownloadDocument` - Download file

**Swagger Documentation**: Available at `/swagger` in development mode

---

## 🔄 Background Jobs (Hangfire)

Automated tasks running on schedules:

- **Bank Sync**: Hourly transaction imports from connected banks
- **Subscription Processing**: Daily check for due subscriptions
- **Data Archival**: Monthly historic data generation
- **Cleanup**: Regular maintenance tasks

**Hangfire Dashboard**: Available at `/hangfire` (requires authentication)

---

## 🏛️ Architecture Patterns

### Clean Architecture

- **Orbit.Core**: Presentation layer (Controllers, API)
- **Orbit.Domain**: Business logic, data access, services
- **Separation of Concerns**: Clear boundaries between layers

### Design Patterns Used

- **Service Layer Pattern**: Business logic encapsulation in dedicated service classes
- **Dependency Injection**: Constructor injection for loose coupling and testability
- **DTO Pattern**: Data transfer objects for API communication
- **Direct DbContext Access**: Services directly use EF Core DbContext (no repository abstraction)
- **Interface Segregation**: Service interfaces define contracts for each domain area

### Database Design

- **Normalized Schema**: Minimize data redundancy
- **Foreign Keys**: Referential integrity
- **Indexes**: Optimized query performance
- **Soft Deletes**: Data recovery capability (where applicable)

---

## 🧪 Testing
To be added

## 📊 Logging & Monitoring

### Serilog Configuration

Logs are written to:
- **Console**: For development debugging
- **File**: Rolling daily logs in `/app/Logs/`
- **Seq**: Centralized log aggregation (optional)

### Log Levels

- **Information**: Normal operations
- **Warning**: Potential issues
- **Error**: Handled exceptions
- **Critical**: Unhandled exceptions, system failures

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

- Follow C# coding conventions
- Use meaningful variable and method names
- Keep methods focused and concise

---

## 🔗 Resources

- **Frontend Documentation**: [orbit.web/README.md](orbit.web/README.md)
- **.NET Documentation**: https://docs.microsoft.com/dotnet/
- **Entity Framework Core**: https://docs.microsoft.com/ef/core/
- **Hangfire**: https://www.hangfire.io/

---

**Built with ❤️ using .NET and Next.js**
