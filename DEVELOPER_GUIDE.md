# Developer Guide: UI Preservation

## Quick Reference

### Current Design System
- **Primary**: Blue gradients (`from-blue-600 to-indigo-600`)
- **Secondary**: Purple gradients (`from-purple-500 to-pink-500`)
- **Cards**: `bg-white rounded-xl shadow-sm border border-gray-200`
- **Buttons**: Blue gradient with white text
- **Tables**: Gray headers with hover effects

### Safe to Change
- Data content and values
- Event handlers and functions
- API calls and state management
- Business logic and validation
- Routing and navigation logic

### Never Change
- CSS classes and styling
- Color values and gradients
- Layout structure and spacing
- Component HTML structure
- Visual design elements

## Common Patterns

### Adding New Data to Tables
```jsx
// ✅ Good - Add new data with same structure
const newOrders = [
  {
    id: 'MO-000004',
    reference: 'MO-000004',
    startDate: 'Next Week',
    finishedProduct: 'New Product',
    componentStatus: 'Available',
    quantity: '15.00',
    unit: 'Units',
    state: 'Draft',
    priority: 'Medium',
    assignee: 'New User'
  }
];

// ❌ Bad - Don't change table structure or styling
// <td className="bg-red-500"> // Don't change classes
```

### Adding New Functionality
```jsx
// ✅ Good - Add functionality without changing UI
const handleExportOrders = () => {
  // New business logic
  exportToCSV(manufacturingOrders);
  // UI remains unchanged
};

// Add button with existing styling
<Button 
  onClick={handleExportOrders}
  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
>
  Export Orders
</Button>
```

### Updating Status Colors
```jsx
// ✅ Good - Use existing color mapping
const getStateColor = (state) => {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'In-Progress': 'bg-yellow-100 text-yellow-800',
    'To Close': 'bg-orange-100 text-orange-800',
    'Closed': 'bg-green-100 text-green-800',
    'New Status': 'bg-purple-100 text-purple-800' // Add new status
  }
  return colors[state] || 'bg-gray-100 text-gray-800'
};
```

### Adding New Menu Items
```jsx
// ✅ Good - Add new menu item with existing structure
const menuItems = [
  // ... existing items
  {
    name: 'Quality Control',
    path: '/quality-control',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    count: 7
  }
];
```

## Component Guidelines

### Sidebar Component
- **Preserve**: All styling, gradients, and layout
- **Can Change**: Menu items data, navigation logic, active state logic
- **Structure**: Keep the same HTML structure and CSS classes

### Data Tables
- **Preserve**: Table structure, styling, hover effects
- **Can Change**: Data content, row data, column data
- **Actions**: Add new action buttons with existing styling

### Cards and Stats
- **Preserve**: Card styling, icon backgrounds, number styling
- **Can Change**: Numbers, text content, icon selection
- **Layout**: Keep grid structure and spacing

### Forms
- **Preserve**: Input styling, button styling, layout
- **Can Change**: Form fields, validation, submission logic
- **Validation**: Add validation without changing visual appearance

## Testing Checklist

Before submitting changes:

- [ ] Visual appearance matches current design
- [ ] All existing functionality still works
- [ ] New functionality integrates seamlessly
- [ ] Responsive design maintained
- [ ] Color scheme consistent
- [ ] Typography unchanged
- [ ] Spacing and layout preserved
- [ ] Interactive states work correctly

## Common Mistakes to Avoid

### ❌ Don't Do This
```jsx
// Changing button colors
<Button className="bg-red-500 text-white"> // Wrong color

// Changing card styling
<div className="bg-gray-800 text-white"> // Wrong background

// Modifying table structure
<table className="border-2 border-red-500"> // Wrong styling

// Changing typography
<h1 className="text-6xl font-black"> // Wrong size/weight
```

### ✅ Do This Instead
```jsx
// Use existing button styling
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">

// Use existing card styling
<div className="bg-white rounded-xl shadow-sm border border-gray-200">

// Use existing table styling
<table className="w-full min-w-[800px]">

// Use existing typography
<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
```

## File Organization

### UI Components (Preserve)
- `components/Sidebar.jsx`
- `components/TopNavbar.jsx`
- `components/Layout.jsx`
- `components/ui/` (all files)

### Functional Components (Can Modify)
- `pages/` (all page components)
- `context/AuthContext.jsx`
- `services/api.js`
- `lib/` (utility functions)

### Styling (Preserve)
- `src/index.css`
- `tailwind.config.js`
- `components.json`

## Backend Integration

When adding new backend functionality:

1. **Keep UI unchanged** - Only update data and handlers
2. **Use existing patterns** - Follow current API call patterns
3. **Maintain error handling** - Use existing error display patterns
4. **Preserve loading states** - Use existing loading indicators

## Example: Adding a New Feature

Let's say you want to add a "Bulk Actions" feature:

```jsx
// ✅ Good implementation
const handleBulkAction = (action) => {
  // New functionality
  if (action === 'delete') {
    deleteSelectedOrders(selectedRows);
  } else if (action === 'export') {
    exportSelectedOrders(selectedRows);
  }
  // UI remains the same
};

// Add to existing UI structure
<div className="flex items-center space-x-2">
  <Button 
    onClick={() => handleBulkAction('delete')}
    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
  >
    Delete Selected
  </Button>
  <Button 
    onClick={() => handleBulkAction('export')}
    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
  >
    Export Selected
  </Button>
</div>
```

This approach maintains the current UI while adding powerful new functionality.
