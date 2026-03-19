# MedixFlow Monorepo

Welcome to the MedixFlow monorepo. This project uses NPM Workspaces to manage multiple applications and shared packages.

## 📁 Project Structure

```text
├── apps/
│   ├── api/          # NestJS/Express Backend (@medixflow/api)
│   └── web/          # React + Vite Frontend (@medixflow/web)
├── packages/
│   ├── shared/       # Common types, constants, and utilities (@medixflow/shared)
│   └── config/       # Shared ESLint, Prettier, and TS configs
├── package.json      # Root package file for monorepo management
└── implementation_plan.md # Details of the monorepo setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- NPM 7+ (supports workspaces)

### 1. Install Dependencies
From the root directory:
```bash
npm install
```

### 2. Development
Run both the API and Web applications concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:api
npm run dev:web
```

### 3. Formatting & Linting
```bash
npm run format    # Format all files with Prettier
npm run lint      # Lint all workspace packages
```

## 🏗 Architecture
This project follows **Clean Architecture** principles:
- **Core**: Business logic, types, and base repository abstractions.
- **Infrastructure**: Database clients, external APIs, and providers.
- **Modules**: Feature-based organization (Auth, Patient, Staff).

## 📄 License
ISC
