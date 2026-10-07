<!-- markdownlint-disable MD033 MD036 MD041 MD045 MD059 -->
<div align="center">
  <br />
  <a href="#" target="_blank">
    <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&h=400&fit=crop" alt="University Library System Banner">
  </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-NextAuth-black?style=for-the-badge&logoColor=white&logo=nextauth&color=000000" alt="nextauth" />
    <img src="https://img.shields.io/badge/-Drizzle_ORM-black?style=for-the-badge&logoColor=white&logo=drizzle&color=C5F0F7" alt="drizzle" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=4169E1" alt="postgresql" />
  </div>

  <h3 align="center">University Library Management System</h3>

  <div align="center">
    A modern, full-stack library management system for universities and educational institutions. Manage book inventory, track borrowing, handle returns, and provide seamless access to library resources.
  </div>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🚀 [Live Demo](#live-demo)
5. 🤸 [Quick Start](#quick-start)
6. 📊 [Business Value](#business-value)
7. 🔧 [Technical Details](#technical-details)
8. 📚 [Database Schema](#database-schema)
9. 🔐 [Authentication](#authentication)
10. 🚨 [FAQ / Troubleshooting](#faq)
11. 🔗 [Links](#links)

## 🤖 Introduction

Built with Next.js and TypeScript, this University Library Management System provides a comprehensive platform for managing university library operations. It enables librarians to manage book inventory, track student borrowing history, handle returns, and maintain a searchable catalog of resources.

**Target Users**: University students, faculty, and library staff

**Problem Solved**: Streamlines traditional library operations that were previously done manually, reducing errors and improving user experience.

## ⚙️ Tech Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| **Next.js** | 14+ | App Router, Server Components, RSC |
| **React** | 18+ | UI Framework |
| **TypeScript** | 5.x | Type safety and better DX |
| **NextAuth.js** | v4 | Authentication with OAuth & Credentials |
| **Drizzle ORM** | 0.45+ | Type-safe database queries |
| **PostgreSQL** | 15+ | Relational database |
| **shadcn/ui** | latest | Accessible UI components |
| **Tailwind CSS** | v3 | Styling |
| **Zod** | v4 | Runtime validation |
| **React Hook Form** | latest | Form state management |

## 🔋 Features

### For Students/Faculty

- 🔍 **Search Catalog**: Find books by title, author, ISBN, or category
- 📚 **Borrow Books**: Request and borrow available books
- 📋 **View Borrowing History**: Track all borrowed items and due dates
- 🔄 **Return Books**: Process returns with automatic due date tracking
- 👤 **User Dashboard**: Personal dashboard showing current borrows and fines

### For Library Staff/Admins

- 📖 **Inventory Management**: Add, edit, and remove books from catalog
- 👥 **User Management**: Manage student and faculty accounts
- 📊 **Borrowing Reports**: Track borrowing patterns and popular books
- ⚙️ **System Settings**: Configure library rules and policies

### Core Features

- **Authentication**: Secure login with NextAuth.js (OAuth + Credentials)
- **Real-time Updates**: Instant reflection of borrowing status changes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Search & Filtering**: Advanced search with category filters
- **Due Date Tracking**: Automatic reminders for returning books

## 🚀 Live Demo

| Platform | URL | Status |
| --- | --- | --- |
| **Vercel** | [Coming Soon](#) | 🔄 Deploying |
| **GitHub** | [github.com/rhixecompany/university-libary-jsm](https://github.com/rhixecompany/university-libary-jsm) | ✅ Active |

---

## 🤸 Quick Start

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/rhixecompany/university-libary-jsm.git
cd university-libary-jsm

# Install dependencies
bun install
# or
bun install

# Set up environment variables
cp .env.example .env.local

# Configure your database URL in .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/library_db

# Push database schema
bun run db:push
# or
bun run db:push

# Start the development server
bun run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Business Value

### For Educational Institutions

- **Efficiency**: Reduces manual book tracking by 80%
- **Accessibility**: 24/7 access to library catalog from any device
- **Cost Savings**: Eliminates need for physical card systems
- **Data Insights**: Borrowing patterns help optimize book purchases

### For Students & Faculty

- **Convenience**: Search and reserve books from anywhere
- **Time Savings**: No more standing in library queues
- **Transparency**: Clear view of borrowing history and due dates
- **Accessibility**: Mobile-friendly interface for on-the-go access

### Key Outcomes

- ✅ Reduced book loss through better tracking
- ✅ Improved user satisfaction with self-service features
- ✅ Faster check-in/check-out processes
- ✅ Better resource allocation based on usage data

---

## 🔧 Technical Details

### Architecture

- **Pattern**: Next.js App Router with Server Actions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with JWT sessions
- **API**: RESTful patterns via Server Actions

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── [feature]/         # Feature-specific components
├── database/              # Drizzle ORM setup
│   ├── schema.ts          # Database schema
│   └── migrations/        # Database migrations
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # Helper functions
├── actions/               # Server Actions
└── types/                 # TypeScript definitions
```

### Key Patterns

- **Server Actions**: All mutations use Next.js Server Actions
- **Type Safety**: Full TypeScript with Zod validation
- **DAL Pattern**: Data Access Layer for clean database queries
- **Component Patterns**: Reusable UI components with shadcn/ui

---

## 📚 Database Schema

### Core Tables

| Table        | Purpose                  |
| ------------ | ------------------------ |
| `users`      | Student/faculty accounts |
| `books`      | Book inventory           |
| `borrows`    | Borrowing records        |
| `categories` | Book categories          |
| `authors`    | Author information       |

### Key Relationships

- Users → Borrows (one-to-many)
- Books → Borrows (one-to-many)
- Books → Categories (many-to-one)
- Books → Authors (many-to-one)

---

## 🔐 Authentication

### Providers Supported

- **Credentials**: Email/password login
- **OAuth**: Google, GitHub (configurable)

### Protected Routes

- `/dashboard/*` - User dashboard
- `/borrow/*` - Borrowing features
- `/admin/*` - Admin panel (admin only)

### Security Features

- Password hashing with bcrypt
- JWT session management
- Route protection via middleware
- Input validation with Zod

---

## 🚨 FAQ / Troubleshooting

### Common Issues

**Database connection fails**

- Verify DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Check database credentials

**Authentication not working**

- Verify NEXTAUTH_SECRET is set
- Check OAuth credentials if using Google/GitHub
- Clear browser cookies and try again

**Build errors**

- Run `bun run type-check` to see type errors
- Ensure all dependencies are installed
- Clear .next cache: `rm -rf .next`

---

## 🔗 Links

- **GitHub**: [github.com/rhixecompany/university-libary-jsm](https://github.com/rhixecompany/university-libary-jsm)
- **Live Demo**: [Coming Soon](#)
- **Related Project**: [Horizon Banking Platform](https://github.com/rhixecompany/banking)

---

## 📈 Future Enhancements

- [ ] Book reservation system
- [ ] Late fee calculation
- [ ] Email notifications
- [ ] QR code scanning for check-in/out
- [ ] Integration with university SSO
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

_Built with ❤️ by Alexander Iseghohi_
_Part of the rhixecompany portfolio_
