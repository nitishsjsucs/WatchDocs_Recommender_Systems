# ⚛️ Frontend Documentation

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Component Documentation](#component-documentation)
- [State Management](#state-management)
- [Routing](#routing)
- [Styling](#styling)
- [API Integration](#api-integration)
- [Build & Deployment](#build--deployment)

---

## Overview

The WatchDocs frontend is a modern **React Single Page Application (SPA)** built with TypeScript, Vite, and TailwindCSS. It provides a beautiful, responsive interface for website monitoring with AI-powered features.

### Key Technologies

- **React 18**: Latest React with Hooks and Concurrent Mode
- **TypeScript**: Full type safety across the application
- **Vite**: Lightning-fast development and optimized builds
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality, accessible component library
- **React Router**: Client-side routing and navigation

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.2.2",
  "vite": "^5.2.0"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^3.3.6",
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "lucide-react": "^0.294.0"
}
```

### Routing & State

```json
{
  "react-router-dom": "^6.20.1"
}
```

### AI & Features

```json
{
  "@google/generative-ai": "^0.24.1",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "motion": "^12.23.24"
}
```

### UI Components (Radix UI)

```json
{
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7"
}
```

---

## Project Structure

```
WatchDocsFE/
├── public/                     # Static assets
│   └── Hero Gradient - 34.jpg  # Background image
│
├── src/
│   ├── components/             # Reusable components
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── RecentWatches.tsx   # Recent watches component
│   │   └── ui/                 # Shadcn UI components
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── pages/                  # Page components
│   │   ├── NewWatch.tsx        # Create new watch page
│   │   ├── WatchPage.tsx       # Dashboard/home page
│   │   ├── WatchDetail.tsx     # Watch details page
│   │   └── WatchTimeline.tsx   # Timeline view page
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── gemini.ts           # Google Gemini AI integration
│   │   ├── storage.ts          # LocalStorage wrapper
│   │   ├── utils.ts            # General utilities (cn, etc.)
│   │   └── validation.ts       # URL validation helpers
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-toast.ts        # Toast notifications hook
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts            # Type definitions
│   │
│   ├── routes.tsx              # Route definitions
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles & Tailwind imports
│   └── vite-env.d.ts           # Vite type declarations
│
├── .env                        # Environment variables (not in git)
├── .gitignore
├── components.json             # Shadcn UI configuration
├── index.html                  # HTML template
├── package.json                # Dependencies & scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node
└── vite.config.js              # Vite configuration
```

---

## Core Features

### 1. **Dual Input Modes**

#### URL Input Mode
- Direct URL entry with real-time validation
- Live website preview
- Instant feedback on URL validity

```typescript
// URL Validation
const isValid = isHttpUrl(url);
const domain = getDomainFromUrl(url);
```

#### AI Chat Mode
- Conversational interface powered by Google Gemini
- Natural language understanding
- URL suggestions based on user intent
- Grounding with Google Search results

```typescript
const geminiChat = new GeminiTopicChat();
const response = await geminiChat.sendMessage(userInput);
```

### 2. **Dashboard**

- Grid view of all monitored websites
- Health status indicators:
  - 🟢 Stable (No changes)
  - 🟡 Minor Changes
  - 🔴 Major Changes
- Quick actions (View, Open Site, Delete)
- Latest scan information

### 3. **Timeline View**

- Chronological history of all scans
- Visual timeline with icons and colors
- Change summaries and details
- Raw content preview

### 4. **Change Detection Display**

Three categories of changes:
- ➕ **Additions**: New content added
- ➖ **Deletions**: Content removed
- ✏️ **Modifications**: Content changed

---

## Component Documentation

### Layout Component (`components/Layout.tsx`)

Main application layout wrapper with navigation.

**Features**:
- Responsive header with logo and navigation
- Animated gradient background
- Footer section
- Consistent spacing and styling

**Usage**:
```tsx
<Layout>
  <YourPageContent />
</Layout>
```

### RecentWatches Component (`components/RecentWatches.tsx`)

Displays recent watches on the dashboard.

**Props**: None (fetches data internally)

**Features**:
- Fetches recent watches from storage
- Displays watch cards with status badges
- Navigation to detail views
- Loading states with skeletons

### Shadcn UI Components (`components/ui/`)

All UI components are from the Shadcn library, which uses Radix UI primitives with Tailwind styling.

**Key Components**:

#### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Click Me
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Alert Dialog
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, ... } from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Toast
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "default", // default, destructive
});
```

---

## Page Components

### NewWatch Page (`pages/NewWatch.tsx`)

**Purpose**: Create new website monitoring entries

**Features**:
- Dual input mode toggle (URL vs AI Chat)
- URL validation and preview
- AI chat integration with Gemini
- Summary call settings configuration
- Recent watches sidebar

**State Management**:
```typescript
const [inputMode, setInputMode] = useState<'url' | 'chat'>('url');
const [url, setUrl] = useState('');
const [chatMessages, setChatMessages] = useState([]);
const [frequency, setFrequency] = useState('daily');
const [voice, setVoice] = useState('Morning dad');
const [detailLevel, setDetailLevel] = useState('medium');
```

**Key Functions**:
- `handleUrlChange()`: Validates and updates URL
- `handleChatSubmit()`: Sends message to Gemini AI
- `handleMonitor()`: Creates new watch and initiates scan

### WatchPage (`pages/WatchPage.tsx`)

**Purpose**: Main dashboard displaying all watches

**Features**:
- Grid layout of watch cards
- Status filtering
- Search functionality
- Refresh all scans
- Navigate to create new watch

### WatchDetail (`pages/WatchDetail.tsx`)

**Purpose**: Detailed view of a specific watch

**Features**:
- Full document information
- Latest scan summary
- Change details (additions, deletions, modifications)
- Actions (refresh scan, delete, view timeline)

### WatchTimeline (`pages/WatchTimeline.tsx`)

**Purpose**: Historical timeline of all scans for a watch

**Features**:
- Chronological scan history
- Visual timeline with status indicators
- Expandable scan details
- Change summaries
- Raw content preview

---

## State Management

### Local State (useState)

Used for component-specific state:
- Form inputs
- UI state (loading, errors)
- Modal open/close states

### Effect Hooks (useEffect)

Used for side effects:
- Data fetching on mount
- Subscribing to events
- Cleanup operations

```typescript
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData();
    setData(data);
  };
  loadData();
}, [dependencies]);
```

### Custom Hooks

#### useToast Hook
```typescript
const { toast } = useToast();

// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully.",
});

// Error toast
toast({
  title: "Error",
  description: "Something went wrong.",
  variant: "destructive",
});
```

### Storage Layer (lib/storage.ts)

Abstraction over localStorage for data persistence.

**API**:
```typescript
// Add a watch
await addWatch(watchData);

// Get all watches
const watches = await getWatches();

// Get single watch by ID
const watch = await getWatch(id);

// Update watch
await updateWatch(id, updatedData);

// Delete watch
await deleteWatch(id);
```

**Note**: This will be migrated to backend API in future versions.

---

## Routing

### Route Configuration (`src/routes.tsx`)

```typescript
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <WatchPage /> },
      { path: 'new', element: <NewWatch /> },
      { path: 'watch/:id', element: <WatchDetail /> },
      { path: 'watch/:id/timeline', element: <WatchTimeline /> },
    ],
  },
]);
```

### Navigation

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to home
navigate('/');

// Navigate to new watch
navigate('/new');

// Navigate to watch detail
navigate(`/watch/${id}`);

// Navigate to timeline
navigate(`/watch/${id}/timeline`);
```

---

## Styling

### TailwindCSS Configuration

**Custom Colors** (tailwind.config.js):
```javascript
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ... Shadcn theme colors
}
```

### Custom CSS Variables (index.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... other variables */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode variables */
}
```

### Glassmorphism Effect

Many components use glassmorphic design:
```css
.glass-card {
  @apply bg-white/10 backdrop-blur-lg border border-white/20;
}
```

### Utility Functions

#### cn() Function (lib/utils.ts)
Merge Tailwind classes with proper precedence:
```typescript
import { cn } from '@/lib/utils';

<div className={cn("base-classes", conditionalClasses, props.className)} />
```

---

## API Integration

### Backend API Communication

Currently, the frontend communicates with the Django backend via REST API.

**Base URL**: Configured in environment or hardcoded
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### API Functions

**Example: Create Document and Scan**
```typescript
const createDocument = async (data: {
  title: string;
  url: string;
  desc?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/createDocumentAndScan/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create document');
  }
  
  return response.json();
};
```

**Example: Get Documents**
```typescript
const getDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/documents/`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  
  return response.json();
};
```

### Google Gemini AI Integration (lib/gemini.ts)

**GeminiTopicChat Class**:
```typescript
export class GeminiTopicChat {
  private model: any;
  private chat: any;
  
  constructor() {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: { /* ... */ },
      systemInstruction: "You are a helpful assistant...",
    });
    this.chat = this.model.startChat();
  }
  
  async sendMessage(message: string) {
    const result = await this.chat.sendMessage(message);
    return result.response;
  }
}
```

---

## TypeScript Types (`src/types/index.ts`)

### Core Types

```typescript
export type LatestScan = {
  id: number;
  changes: boolean;
  change_level: string;
  change_summary: string | null;
  current_summary: string;
  scan_date: string;
  additions: string[];
  deletions: string[];
  modifications: string[];
};

export type WatchItem = {
  id: number;
  title: string;
  desc: string;
  url: string;
  status: string;
  created_date: string;
  latest_scan: LatestScan;
};

export type DocumentsResponse = {
  documents: WatchItem[];
  total_count: number;
};

export type ScanHistory = {
  id: number;
  date: string;
  changes: boolean;
  change_level: string;
  change_summary: string | null;
  current_summary: string;
  raw_content_preview?: string;
  additions: string[];
  deletions: string[];
  modifications: string[];
};

export type WatchTimelineResponse = {
  document: {
    id: number;
    title: string;
    desc: string;
    url: string;
    status: string;
    category: string;
    created_date: string;
    scan_count: number;
    latest_scan: LatestScan & {
      current_summary: string;
    };
    scan_history: ScanHistory[];
  };
  total_scans: number;
};

export type PreviewStatus = 'loading' | 'valid' | 'invalid' | 'blocked' | 'error';
```

---

## Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type checking
npm run build  # Runs tsc then vite build
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

Create `.env` file in the root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:8000
```

**Accessing in code**:
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, GitHub Pages)
   - Build output is in `dist/` folder
   - Upload contents of `dist/`

2. **Docker**
   - Use nginx to serve static files
   - Example Dockerfile provided in deployment docs

3. **CDN**
   - Deploy to S3 + CloudFront
   - Deploy to Azure Static Web Apps

---

## Performance Optimization

### Code Splitting

Vite automatically code-splits by route:
```typescript
const LazyComponent = lazy(() => import('./Component'));
```

### Image Optimization

- Use WebP format
- Lazy load images
- Use responsive images

### Bundle Size

Check bundle size:
```bash
npm run build -- --mode production
```

Analyze bundle:
```bash
npm install -D rollup-plugin-visualizer
```

---

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

### Keyboard Navigation

All interactive elements are keyboard accessible via Radix UI.

### Screen Reader Support

Shadcn UI components have built-in screen reader support.

---

## Testing (Future Enhancement)

### Recommended Tools

- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

**Last Updated**: December 2025  
**Version**: 1.0
