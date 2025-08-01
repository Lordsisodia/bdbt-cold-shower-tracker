# BDBT Hooks Implementation Guide

## 🎯 Overview
Enhanced BDBT project with comprehensive hooks from SISO ecosystem.

## 📁 Structure

```
.claude/
├── project.json          # Project-specific Claude hooks
├── settings.json         # Claude Code hooks configuration
└── hooks/
    ├── scripts/         # Hook script files
    │   ├── session-context.sh
    │   └── prettier-format.sh
    └── templates/       # Hook templates

src/hooks/
├── index.ts            # Main export file
├── auth/               # Authentication hooks
│   ├── useAuth.ts      # Existing auth hook
│   └── usePermissions.ts # Role-based permissions
├── client/             # Client management
│   └── useClientData.ts
├── project/            # Project/Tips management
│   └── useTipOperations.ts
├── ui/                 # UI utilities
│   ├── useToast.ts
│   ├── useMobile.tsx
│   └── usePagination.tsx
└── utils/              # General utilities
    ├── useLocalStorage.ts
    └── useDebounce.ts
```

## 🔧 Claude Code Hooks

### Session Start
- Displays git status, recent commits, available scripts
- Shows environment status and tips system configuration

### Pre-Tool Use
- **Edit**: Auto-formats with Prettier
- **Write**: Backs up critical config files

### Post-Tool Use
- **Edit**: Runs TypeScript checking
- **MultiEdit**: Suggests build check after multiple edits

### Session Stop
- Logs session completion with timestamp

## 🎨 React Hooks Added

### UI Hooks
- `useToast` - Toast notifications system
- `useMobile` - Mobile detection
- `usePagination` - Pagination logic

### Utility Hooks
- `useLocalStorage` - Persistent storage with sync
- `useDebounce` - Debounced values

### Auth Hooks
- `usePermissions` - Role-based access control

### Project Hooks
- `useTipOperations` - CRUD operations for tips
- `useClientData` - Client data fetching

## 🚀 Usage Examples

### Toast Notifications
```tsx
const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Tip saved successfully',
  type: 'success',
  duration: 3000,
});
```

### Pagination
```tsx
const { currentPage, goToPage, nextPage } = usePagination({
  totalItems: 100,
  itemsPerPage: 20,
});
```

### Permissions
```tsx
const { hasPermission } = usePermissions();

if (hasPermission('tips.edit')) {
  // Show edit button
}
```

### Local Storage
```tsx
const [settings, setSettings] = useLocalStorage('app-settings', {
  theme: 'light',
  sidebar: true,
});
```

## 🔄 Next Steps

1. Test all hooks with existing components
2. Add more specialized hooks as needed
3. Configure additional Claude Code hooks
4. Document hook patterns for team