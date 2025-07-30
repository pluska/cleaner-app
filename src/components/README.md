# 🏗️ Component Architecture

This directory contains all React components organized in a modular structure for better maintainability and scalability.

## 📁 Directory Structure

```
src/components/
├── auth/                    # Authentication components
│   ├── AuthForm.tsx        # Login/Signup form
│   └── AuthCallback.tsx    # OAuth callback handler
├── dashboard/              # Dashboard-specific components
│   ├── core/              # Core dashboard components
│   │   ├── DashboardNav.tsx
│   │   ├── DashboardContent.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── DashboardDragDropProvider.tsx
│   ├── tasks/             # Task management components
│   │   ├── TaskItem.tsx
│   │   ├── DailyTasks.tsx
│   │   ├── AllTasksView.tsx
│   │   ├── DraggableTask.tsx
│   │   ├── DroppableArea.tsx
│   │   ├── ComingSoonTasks.tsx
│   │   └── ComingSoonTasksWrapper.tsx
│   ├── analytics/         # Analytics and statistics
│   │   ├── AnalyticsView.tsx
│   │   ├── AnalyticsHeader.tsx
│   │   └── DashboardStats.tsx
│   ├── gamification/      # Gamification system
│   │   ├── AreaHealth.tsx
│   │   ├── ToolInventory.tsx
│   │   ├── UserProfile.tsx
│   │   └── GamificationTester.tsx
│   ├── guide/             # User guide components
│   │   ├── UserGuide.tsx
│   │   └── GuideHeader.tsx
│   ├── schedule/          # Schedule management
│   │   ├── ScheduleView.tsx
│   │   ├── ScheduleHeader.tsx
│   │   ├── WeeklyView.tsx
│   │   └── RescheduleModal.tsx
│   └── AuthDebugger.tsx   # Debug component (legacy)
└── ui/                    # Reusable UI components
    ├── forms/             # Form-related components
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   └── Select.tsx
    ├── feedback/          # User feedback components
    │   ├── Notification.tsx
    │   ├── Loading.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── ErrorMessage.tsx
    │   └── SuccessMessage.tsx
    ├── layout/            # Layout components
    │   ├── Card.tsx
    │   └── LanguageSwitcher.tsx
    └── data-display/      # Data presentation components
        ├── Badge.tsx
        ├── Tabs.tsx
        └── ErrorBoundary.tsx
```

## 🎯 Component Categories

### **Dashboard Components**

#### **Core (`/dashboard/core/`)**

- **DashboardNav**: Main navigation bar
- **DashboardContent**: Main dashboard container
- **DashboardHeader**: Dashboard page headers
- **DashboardDragDropProvider**: Drag and drop context provider

#### **Tasks (`/dashboard/tasks/`)**

- **TaskItem**: Individual task display and interaction
- **DailyTasks**: Today's tasks view
- **AllTasksView**: Complete task list view
- **DraggableTask**: Drag-enabled task component
- **DroppableArea**: Drop zones for task reordering
- **ComingSoonTasks**: Future tasks preview

#### **Analytics (`/dashboard/analytics/`)**

- **AnalyticsView**: Main analytics dashboard
- **AnalyticsHeader**: Analytics page header
- **DashboardStats**: Statistics and metrics display

#### **Gamification (`/dashboard/gamification/`)**

- **AreaHealth**: Home area health tracking
- **ToolInventory**: Cleaning tools management
- **UserProfile**: User profile and progress
- **GamificationTester**: Debug gamification features

#### **Guide (`/dashboard/guide/`)**

- **UserGuide**: Interactive user guide
- **GuideHeader**: Guide page header

#### **Schedule (`/dashboard/schedule/`)**

- **ScheduleView**: Calendar and schedule view
- **ScheduleHeader**: Schedule page header
- **WeeklyView**: Weekly task overview
- **RescheduleModal**: Task rescheduling dialog

### **UI Components**

#### **Forms (`/ui/forms/`)**

- **Button**: Primary, secondary, and variant buttons
- **Input**: Text input fields with validation
- **Select**: Dropdown selection components

#### **Feedback (`/ui/feedback/`)**

- **Notification**: Toast notifications and alerts
- **Loading**: Loading states and spinners
- **LoadingSpinner**: Animated loading indicators
- **ErrorMessage**: Error message display
- **SuccessMessage**: Success message display

#### **Layout (`/ui/layout/`)**

- **Card**: Container components with styling
- **LanguageSwitcher**: Language selection component

#### **Data Display (`/ui/data-display/`)**

- **Badge**: Status and category badges
- **Tabs**: Tabbed interface components
- **ErrorBoundary**: Error boundary wrapper

## 📦 Import Patterns

### **Using Index Files**

Each subdirectory has an `index.ts` file that exports all components:

```typescript
// Import from specific category
import { Button, Input, Select } from "@/components/ui/forms";
import { Card, LanguageSwitcher } from "@/components/ui/layout";
import { TaskItem, DailyTasks } from "@/components/dashboard/tasks";
import { AreaHealth, ToolInventory } from "@/components/dashboard/gamification";
```

### **Direct Imports**

You can also import directly from specific files:

```typescript
import { Button } from "@/components/ui/forms/Button";
import { TaskItem } from "@/components/dashboard/tasks/TaskItem";
```

## 🔧 Development Guidelines

### **Adding New Components**

1. **Choose the appropriate category** based on component purpose
2. **Create the component file** in the correct subdirectory
3. **Update the index.ts** file to export the new component
4. **Follow naming conventions**:
   - Use PascalCase for component names
   - Use descriptive, purpose-based names
   - Add appropriate TypeScript interfaces

### **Component Organization Principles**

- **Single Responsibility**: Each component has one clear purpose
- **Logical Grouping**: Related components are grouped together
- **Reusability**: UI components are designed for reuse
- **Maintainability**: Clear structure makes maintenance easier

### **File Naming Conventions**

- **Component files**: `PascalCase.tsx` (e.g., `TaskItem.tsx`)
- **Index files**: `index.ts` for exports
- **Type files**: `types.ts` for shared types
- **Test files**: `ComponentName.test.tsx`

## 🚀 Benefits of This Structure

### **Scalability**

- Easy to add new components without cluttering
- Clear separation of concerns
- Logical grouping prevents confusion

### **Maintainability**

- Related components are co-located
- Easy to find specific functionality
- Clear import paths

### **Team Collaboration**

- Multiple developers can work on different areas
- Clear ownership of component categories
- Reduced merge conflicts

### **Code Reusability**

- UI components are easily shared
- Consistent patterns across the app
- Centralized styling and behavior

## 📋 Migration Notes

This structure was created from a flat component organization. All import statements have been updated to use the new paths. If you encounter any import errors, check that the component is being imported from the correct subdirectory.
