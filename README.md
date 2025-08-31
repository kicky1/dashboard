# Dashboard App - Personal Finance Tracker

<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
  Personal Finance Dashboard
</h1>

> A comprehensive personal finance tracking mobile app built with React Native and Expo, featuring expense tracking, income management, and financial insights.

## 📱 What This App Does

**Dashboard App** is a personal finance management application that helps you:

- **Track Expenses**: Record and categorize your daily expenses with detailed notes
- **Manage Income**: Log various income sources including employment, freelance, investments, and more
- **Financial Insights**: View spending patterns, income trends, and financial overview through interactive charts
- **Multi-Currency Support**: Handle transactions in different currencies with real-time conversion rates
- **Personalization**: Customize themes, language preferences, and dashboard settings
- **Secure Authentication**: Google OAuth integration with Supabase backend

### Key Features

- **Expense Categories**: Food, Transport, Entertainment, Utilities, Healthcare, Shopping, Education, Other
- **Income Sources**: Employment, Freelance, Investment, Business, Rental, Other
- **Dashboard Overview**: Visual charts showing income vs expenses, recent transactions, and financial summary
- **Multi-language Support**: English and Polish localization
- **Theme Support**: Light, Dark, and System theme preferences
- **Offline Capability**: Local data storage with MMKV for fast access

## 🚀 How to Run the App

### Prerequisites

- [React Native dev environment](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall) (macOS/Linux only)
- [Pnpm](https://pnpm.io/installation)
- [Cursor](https://www.cursor.com/) or [VS Code Editor](https://code.visualstudio.com/download)

### Quick Start

1. **Clone the repository**

   ```sh
   git clone https://github.com/user/repo-name
   cd ./repo-name
   ```

2. **Install dependencies**

   ```sh
   pnpm install
   ```

3. **Set up environment variables**

   ```sh
   # Copy the example environment file
   cp .env.example .env.development

   # Edit with your configuration
   nano .env.development
   ```

4. **Run the app**

   **iOS:**

   ```sh
   pnpm ios
   ```

   **Android:**

   ```sh
   pnpm android
   ```

   **Web (for development):**

   ```sh
   pnpm web
   ```

### Available Scripts

- `pnpm start` - Start Expo development server
- `pnpm ios` - Run on iOS simulator
- `pnpm android` - Run on Android emulator
- `pnpm web` - Run in web browser
- `pnpm test` - Run unit tests
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## 🎯 How to Use the App

### 1. **Dashboard (Home)**

- View your financial overview with income vs expenses charts
- See recent transactions and spending patterns
- Quick access to add new expenses or income
- Currency conversion display based on your language preference

### 2. **Expenses Management**

- Tap the **+** button to add new expenses
- Select from predefined categories (Food, Transport, etc.)
- Add amount, date, and optional notes
- Edit or delete existing expenses by tapping on them
- View expense history with filtering options

### 3. **Income Tracking**

- Add various income sources through the income tab
- Categorize income (Employment, Freelance, Investment, etc.)
- Track income patterns and trends
- Manage recurring income entries

### 4. **Settings & Personalization**

- **Language**: Switch between English and Polish
- **Theme**: Choose Light, Dark, or System theme
- **Account**: View app version and manage your profile
- **Data Management**: Reset all data or sign out

### 5. **Authentication**

- Sign in with Google OAuth
- Secure user data storage with Supabase
- Automatic session management

## 🛠️ Technologies Used

### **Frontend & Mobile**

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript development
- **Nativewind** - Tailwind CSS for React Native
- **React Router** - File-based routing with Expo Router

### **State Management & Data**

- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **React Query Kit** - Enhanced React Query utilities
- **MMKV** - Fast key-value storage for React Native

### **UI & Animations**

- **React Native Reanimated** - High-performance animations
- **React Native Gesture Handler** - Touch and gesture handling
- **Moti** - Animation library for React Native
- **React Native SVG** - SVG support for charts and icons

### **Backend & Services**

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Axios** - HTTP client for API requests
- **Google OAuth** - Authentication service

### **Development Tools**

- **ESLint** - Code linting and formatting
- **Jest** - Unit testing framework
- **Husky** - Git hooks for pre-commit checks
- **Commitlint** - Conventional commit message validation

## 🔧 Environment Configuration

Create environment files based on your deployment environment:

### `.env.development` (Local Development)

```bash
# App Configuration
APP_ENV=development
NAME=dashboard-app
SCHEME=dashboard-app
BUNDLE_ID=com.dashboard-app
PACKAGE=com.dashboard-app
VERSION=0.0.1

# API Configuration
API_URL=http://localhost:8081
VAR_NUMBER=123
VAR_BOOL=true

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Build Configuration
EXPO_ACCOUNT_OWNER=your-expo-username
EAS_PROJECT_ID=your-eas-project-id
SECRET_KEY=your-secret-key
GH_TOKEN=your-github-token
```

### `.env.staging` (Staging Environment)

```bash
APP_ENV=staging
# ... other variables with staging values
```

### `.env.production` (Production Environment)

```bash
APP_ENV=production
# ... other variables with production values
```

## 📁 Project Structure

```
src/
├── api/                    # API related code (axios, react query)
├── app/                    # Main entry point for Expo Router
│   ├── (app)/             # Protected app routes
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── expenses.tsx   # Expenses management
│   │   ├── income.tsx     # Income tracking
│   │   └── settings.tsx   # App settings
│   ├── login.tsx          # Authentication screen
│   └── _layout.tsx        # Root layout
├── components/             # Shared components
│   ├── ui/                # Core UI components
│   └── settings/          # Settings-specific components
├── lib/                    # Shared libraries
│   ├── auth/              # Authentication logic
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   └── storage.tsx        # Data persistence
├── translations/           # Language files (en.json, pl.json)
└── types/                  # TypeScript type definitions
```

## 🧪 Testing

Run the test suite:

```sh
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:ci

# Run tests in watch mode
pnpm test:watch
```

## 📱 Building for Production

### iOS

```sh
# Development build
pnpm build:development:ios

# Staging build
pnpm build:staging:ios

# Production build
pnpm build:production:ios
```

### Android

```sh
# Development build
pnpm build:development:android

# Staging build
pnpm build:staging:android

# Production build
pnpm build:production:android
```

## 🤝 Contributing

This project follows conventional commit standards:

- `fix:` - Bug fixes
- `feat:` - New features
- `perf:` - Performance improvements
- `docs:` - Documentation changes
- `style:` - Formatting changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📚 Additional Resources

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project Structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment Variables](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data Fetching](https://starter.obytes.com/guides/data-fetching)

---

**Built with ❤️ using [Obytes starter](https://starter.obytes.com)**
