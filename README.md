# Expense Tracker - Mobile Frontend

A production-grade mobile Expense Tracker application built with React Native, Expo, TypeScript, and Expo Router. Designed to allow users to record, manage, analyze, and monitor their daily expenses efficiently.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How to Run](#how-to-run)
- [TypeScript & Quality Checks](#typescript--quality-checks)
- [Project Structure](#project-structure)
- [Architecture & Standards](#architecture--standards)

---

## Project Purpose

The primary objective of **Expense Tracker** is to empower users with full clarity and control over their personal finances. Users can:
- Quickly record everyday expenses and categorize transactions.
- Monitor cash flow, monthly limits, and payment methods.
- Analyze spending behaviors through visual metrics and summaries.
- Maintain persistence locally with offline access and securely store sensitive authentication data.

---

## Technology Stack

| Layer / Concern | Technology | Purpose |
|---|---|---|
| **Core Framework** | [React Native](https://reactnative.dev/) (0.86+) & [Expo](https://expo.dev/) (SDK 57) | Cross-platform native mobile foundation |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static typing and code reliability |
| **Navigation & Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (v57) | File-system based routing and deep link handling |
| **Global State Management** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight, performant, boilerplate-free state store |
| **HTTP & API Client** | [Axios](https://axios-http.com/) | Typed API requests with interceptors for bearer tokens |
| **Form Management** | [React Hook Form](https://react-hook-form.com/) | Performant, flexible form validation |
| **Schema Validation** | [Zod](https://zod.dev/) | Declarative schema validation for forms and payloads |
| **Local Persistence** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | Key-value offline persistence for settings/caches |
| **Secure Storage** | [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) | Hardware-backed encrypted storage for auth tokens |
| **UI Design System** | [React Native Paper](https://callstack.github.io/react-native-paper/) (MD3) | Material Design 3 UI components and theming |
| **Vector Icons & Graphics** | [@expo/vector-icons](https://icons.expo.fyi/) & [react-native-svg](https://github.com/software-mansion/react-native-svg) | Scalable vector iconography and graphics |
| **Date & Time Utilities** | [date-fns](https://date-fns.org/) | Comprehensive date manipulation, parsing, and formatting |

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended; v22 LTS tested)
- [npm](https://www.npmjs.com/) (v9+)
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device (iOS/Android), or an Android Emulator / iOS Simulator.

---

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd Expense-Tracker-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## How to Run

Start the Expo development server:

```bash
npm start
```
or
```bash
npx expo start
```

### Options:
- **Run on Android Emulator / Device**:
  ```bash
  npm run android
  ```
  *(Press `a` in the terminal to switch directly to Android)*
- **Run on iOS Simulator / Device**:
  ```bash
  npm run ios
  ```
  *(Press `i` in the terminal to switch directly to iOS)*
- **Run in Web Browser**:
  ```bash
  npm run web
  ```
  *(Press `w` in the terminal to open web preview)*
- **Physical Device via Expo Go**:
  Scan the QR code displayed in the terminal using the Expo Go app (Android) or the native Camera app (iOS).

---

## TypeScript & Quality Checks

Run TypeScript compiler validation to verify type safety across all files:

```bash
npm run type-check
```

Check Expo dependency version compatibility:

```bash
npx expo install --check
```

---

## Project Structure

```
Expense-Tracker-Frontend/
├── app/                                  # Expo Router file-system routing
│   ├── _layout.tsx                       # Root layout (Theme, Safe Area, Stack Navigation)
│   └── index.tsx                         # Entry screen / Welcome verification screen
├── assets/                               # Static images, icons, and splash assets
├── src/                                  # Application core source code
│   ├── api/                              # Network layer
│   │   ├── client.ts                     # Axios client configured with interceptors
│   │   └── index.ts                      # Barrel export
│   ├── components/                       # Reusable UI component library
│   │   ├── common/                       # Atomic reusable widgets (Buttons, Inputs, Cards)
│   │   └── feedback/                     # Feedback widgets (Snackbars, Dialogs, Loaders)
│   ├── constants/                        # Global design tokens and configurations
│   │   ├── colors.ts                     # Color tokens (Light and Dark palettes)
│   │   ├── config.ts                     # App constants & API endpoints
│   │   ├── theme.ts                      # React Native Paper MD3 theme configuration
│   │   └── index.ts                      # Barrel export
│   ├── hooks/                            # Custom React hooks
│   │   └── index.ts                      # Barrel export
│   ├── navigation/                       # Navigation parameter definitions
│   │   └── types.ts                      # Route type definitions
│   ├── services/                         # Storage & Native abstractions
│   │   ├── storage.service.ts            # Typed AsyncStorage service wrapper
│   │   ├── secure-store.service.ts       # SecureStore token storage service
│   │   └── index.ts                      # Barrel export
│   ├── store/                            # Global state management (Zustand)
│   │   ├── auth.store.ts                 # Authentication & user session store
│   │   ├── expense.store.ts              # Expense management & filter store
│   │   └── index.ts                      # Barrel export
│   ├── types/                            # Domain models and TypeScript declarations
│   │   ├── api.types.ts                  # Generic API responses and errors
│   │   ├── expense.types.ts              # Core expense models, categories, filters
│   │   └── index.ts                      # Barrel export
│   └── utils/                            # Helper utilities
│       ├── date.ts                       # date-fns helper functions
│       ├── formatters.ts                 # Currency and number formatters
│       ├── validation.ts                 # Zod validation schemas
│       └── index.ts                      # Barrel export
├── .npmrc                                # npm configuration for peer dependencies
├── app.json                              # Expo application configuration & plugins
├── package.json                          # Dependencies and lifecycle scripts
├── tsconfig.json                         # TypeScript configuration with @/* path aliases
└── README.md                             # Project documentation
```

---

## Architecture & Standards

- **Routing**: Managed exclusively through `app/` utilizing Expo Router v4+.
- **Path Aliases**: Preconfigured in `tsconfig.json` (`@/*` maps to `./src/*`, `@app/*` maps to `./app/*`).
- **Separation of Concerns**:
  - `services/` contains I/O abstractions (AsyncStorage, SecureStore).
  - `api/` manages HTTP traffic and session headers.
  - `store/` manages client-side reactive state via Zustand.
  - `utils/` houses pure functions and validation schemas.
