# FinanceFlow Agent Guidelines

This document provides essential information for AI agents working on the FinanceFlow codebase.

## Project Overview

FinanceFlow is a Next.js personal finance management application with Firebase integration. It supports both guest mode (local storage) and cloud sync modes, with expense/earning tracking, categorization, budgeting, and financial insights.

## Development Commands

### Core Commands
```bash
# Development
npm run dev          # Start development server on port 9002 with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check (tsc --noEmit)

# Testing
# Note: No test framework is currently configured in this project
```

## Technology Stack

- **Framework**: Next.js 15.5.9 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google login)
- **State Management**: React Context (data-context.tsx)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts

## Code Style Guidelines

### Import Organization
```typescript
// 1. React/Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party library imports
import { collection, doc } from 'firebase/firestore';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 3. Local imports (use @ alias)
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Expense, Category } from '@/lib/definitions';
```

### TypeScript Standards
- Strict mode enabled - all types must be explicitly defined
- Use `type` for object types, `interface` for class-like interfaces
- Export types from `@/lib/definitions.ts`
- Use generic types where appropriate
- Prefer `unknown` over `any` when type is uncertain

### Component Patterns

#### Functional Components
```typescript
// Use forwardRef for components that need ref forwarding
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-styles", className)}
        {...props}
      />
    );
  }
);
Component.displayName = "Component";
```

#### shadcn/ui Pattern
- Use class-variance-authority (cva) for component variants
- Export both component and variants
- Use `cn()` utility for class merging
- Follow established component structure from `@/components/ui/`

### Styling Guidelines

#### Tailwind CSS
- Use CSS variables for theming (defined in tailwind.config.ts)
- Follow established color scheme: teal primary, muted blue accent
- Use utility classes for layout and spacing
- Keep component-specific styles in component files
- Use semantic color names (primary, secondary, destructive, success)

#### Responsive Design
- Mobile-first approach using Tailwind breakpoints
- Use `useMobile()` hook for responsive behavior
- Test on both mobile and desktop viewports

### File Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── [feature].tsx   # Feature-specific components
├── context/             # React Context providers
├── firebase/           # Firebase configuration and utilities
├── hooks/              # Custom React hooks
└── lib/                # Utilities and type definitions
```

### Error Handling
- Use Firebase error handling utilities from `@/firebase/errors.ts`
- Implement user-friendly error messages with `useToast()` hook
- Wrap async operations in try-catch blocks
- Provide fallback states for data fetching

### State Management
- Use React Context for global state (`data-context.tsx`)
- Local state with useState/useReducer for component state
- Use useCallback/useMemo for performance optimization
- Firebase real-time listeners for live data sync

### Naming Conventions
- **Components**: PascalCase (e.g., `ExpenseTracker`, `AddCategory`)
- **Files**: kebab-case (e.g., `add-expense.tsx`, `date-picker.tsx`)
- **Variables/Functions**: camelCase (e.g., `handleSubmit`, `expenseData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CURRENCY`, `MAX_FILE_SIZE`)
- **Types**: PascalCase (e.g., `Expense`, `Category`, `ApiResponse`)

### Firebase Integration
- Use non-blocking updates for better UX (`@/firebase/non-blocking-updates.ts`)
- Implement proper offline support for guest mode
- Use serverTimestamp() for consistent timestamp handling
- Batch Firestore operations when possible
- Handle Firebase authentication state properly

### Form Handling
- Use React Hook Form with Zod schema validation
- Implement proper form reset patterns
- Use controlled components for form inputs
- Handle loading and error states appropriately

### Performance Considerations
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use dynamic imports for large components
- Optimize re-renders with useMemo/useCallback
- Implement virtualization for long lists (when needed)

## Specific Patterns

### Icon Usage
- Import icons from lucide-react library
- Use consistent icon sizes and styling
- Provide meaningful alt text for accessibility

### Date Handling
- Use date-fns library for date manipulation
- Store dates as Date objects in state
- Use consistent date formatting across components
- Handle timezone considerations

### Data Export/Import
- Support JSON format for data portability
- Include proper data validation on import
- Maintain backward compatibility when possible
- Handle large datasets efficiently

## Testing Guidelines

Since no test framework is currently configured:
- Add testing setup if implementing new features
- Focus on manual testing in development environment
- Test both guest mode and authenticated mode
- Verify responsive design on multiple devices

## Security Considerations

- Never commit Firebase configuration secrets
- Validate all user inputs, especially before Firestore operations
- Use proper Firebase security rules
- Implement rate limiting for API calls (when applicable)
- Sanitize data before export/import operations