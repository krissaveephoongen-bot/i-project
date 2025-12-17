# UI Styling Standards - Project Management System

## Core Principle
**All forms and modals MUST use white backgrounds for maximum readability. No glass morphism effects.**

---

## Form Styling Standards

### Input Fields
```tsx
<input
  type="text"
  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
/>
```

**Required Classes**:
- `border border-gray-300` - Light gray border
- `bg-white` - White background (NO dark mode variants)
- `px-3 py-2` - Padding
- `rounded-lg` - Border radius
- `focus:ring-blue-500 focus:border-blue-500` - Focus state

### Select/Dropdown Fields
```tsx
<select
  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option>Select option</option>
</select>
```

**Same standards as input fields**

### Textarea Fields
```tsx
<textarea
  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
  rows={3}
/>
```

### Label Styling
```tsx
<label className="text-sm font-medium text-gray-700">
  Field Label
</label>
```

**Required Classes**:
- `text-sm` - Small text size
- `font-medium` - Medium weight
- `text-gray-700` - Dark gray color (NO dark mode variants)

---

## Modal Styling Standards

### Modal Container
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
    {/* Content */}
  </Card>
</div>
```

**Required Classes**:
- `fixed inset-0` - Full screen overlay
- `bg-black bg-opacity-50` - Dark overlay
- `z-50` - High z-index for visibility
- `bg-white` - White background for card

### Modal Header
```tsx
<CardHeader className="flex flex-row items-center justify-between space-y-0">
  <CardTitle>Modal Title</CardTitle>
  <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
    <X className="h-5 w-5" />
  </button>
</CardHeader>
```

### Modal Content
```tsx
<CardContent className="p-6">
  {/* Form fields here */}
</CardContent>
```

---

## Color Scheme

### Text Colors (Light Mode ONLY)
| Element | Color | Class |
|---------|-------|-------|
| Labels | Dark Gray | `text-gray-700` |
| Descriptions | Medium Gray | `text-gray-600` |
| Disabled | Light Gray | `text-gray-500` |
| Links | Blue | `text-blue-600` |
| Error | Red | `text-red-600` |
| Success | Green | `text-green-600` |

### Background Colors
| Element | Color | Class |
|---------|-------|-------|
| Input/Select | White | `bg-white` |
| Form Section | Light Gray | `bg-gray-50` |
| Button Primary | Blue | `bg-blue-600` |
| Button Secondary | Gray | `bg-gray-300` |
| Error Alert | Red | `bg-red-50` |
| Success Alert | Green | `bg-green-50` |

### Border Colors
| Element | Color | Class |
|---------|-------|-------|
| Input | Light Gray | `border-gray-300` |
| Focus Ring | Blue | `ring-blue-500` |
| Divider | Light Gray | `border-gray-200` |

---

## Status Badge Colors

### Project Status
```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'active': return 'bg-blue-100 text-blue-800';
    case 'planning': return 'bg-yellow-100 text-yellow-800';
    case 'on-hold': return 'bg-orange-100 text-orange-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

### Billing Status
```tsx
const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  delivered: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-300 text-gray-900',
};
```

### Issue Status
```tsx
const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
  'on-hold': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-purple-100 text-purple-800',
};
```

---

## Component Examples

### Form Section
```tsx
<Card className="bg-white">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Field Label
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  </CardContent>
</Card>
```

### Summary Cards
```tsx
<Card className="bg-white">
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">Label</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">Value</p>
      </div>
      <Icon className="h-8 w-8 text-blue-500" />
    </div>
  </CardContent>
</Card>
```

### Data Display
```tsx
<Card className="bg-gray-50">
  <CardHeader>
    <CardTitle className="text-base">Section Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div>
      <p className="text-sm text-gray-600 font-medium">Label</p>
      <p className="text-gray-900 font-semibold">Value</p>
    </div>
  </CardContent>
</Card>
```

---

## DO's and DON'Ts

### DO ✅
- Use `bg-white` for all form backgrounds
- Use `border-gray-300` for input borders
- Apply `focus:ring-blue-500 focus:border-blue-500` to inputs
- Use `text-gray-700` for labels
- Keep forms readable and clean
- Use proper spacing with `space-y-4`, `space-x-2`
- Add focus states for accessibility

### DON'T ❌
- Don't use dark mode variants (`dark:bg-gray-800`, `dark:text-gray-300`)
- Don't use glass morphism effects (`backdrop-blur`, `bg-opacity-20`)
- Don't use inconsistent borders or colors
- Don't forget focus states
- Don't nest forms or modals excessively
- Don't use undefined colors
- Don't forget to add proper padding and margins

---

## Responsive Design

### Breakpoints
```tsx
// Mobile first
className="w-full md:w-1/2 lg:w-1/3"

// Grid layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Flex layouts
className="flex flex-col md:flex-row gap-4"
```

### Mobile Considerations
- Single column forms on mobile
- Full-width buttons
- Larger touch targets (min 44px)
- Adequate padding on modals

---

## Accessibility Standards

### Semantic HTML
```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="name">Name</label>
  <input id="name" type="text" />
  <button type="submit">Submit</button>
</form>
```

### ARIA Labels
```tsx
<button
  aria-label="Close modal"
  onClick={handleClose}
>
  <X />
</button>
```

### Color Contrast
- Text on white background: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- Focus indicators: Always visible

---

## Implementation Checklist

- [ ] Form has white background
- [ ] All inputs have gray borders
- [ ] Focus states are blue
- [ ] Labels are dark gray, NOT using dark mode variants
- [ ] Modal has white background
- [ ] No glass morphism effects
- [ ] Proper spacing and padding
- [ ] Form is responsive
- [ ] Error messages are red
- [ ] Success messages are green
- [ ] Buttons have proper contrast
- [ ] Form is keyboard accessible

---

## Code Review Questions

1. Are there any `dark:` prefixed classes on form elements?
2. Does every form have `bg-white`?
3. Are focus states visible and blue?
4. Are labels using `text-gray-700`?
5. Are there any glass morphism effects?
6. Is the modal overlay correct (black 50% opacity)?
7. Are inputs using `border-gray-300`?
8. Is the spacing consistent throughout?

If any answer is NO, the implementation needs adjustment.

---

**Version**: 1.0
**Last Updated**: December 2024
**Status**: ✅ Approved for Implementation
