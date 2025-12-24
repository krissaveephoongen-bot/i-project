# Design System - Quick Start Guide

## Color Palette

```
Background:      #FFFFFF (White) | #F8F9FA (Light Gray)
Primary:         #22c55e (Teal/Green) - for success, main actions
Accent:          #0ea5e9 (Blue) - for secondary actions
Warning:         #f59e0b (Yellow) - for pending, in-progress
Error:           #ef4444 (Red) - for errors, overdue
Neutral:         #6b7280 (Gray) - for secondary text
```

---

## Common Patterns

### Card Component
```jsx
<div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-neutral-900">Title</h3>
  <p className="text-sm text-neutral-600 mt-2">Content</p>
</div>
```

### Status Badge
```jsx
// Success
<span className="bg-success-50 text-success-600 px-3 py-1 rounded border border-success-200">
  Completed
</span>

// Warning
<span className="bg-warning-50 text-warning-600 px-3 py-1 rounded border border-warning-200">
  Pending
</span>

// Error
<span className="bg-error-50 text-error-600 px-3 py-1 rounded border border-error-200">
  Rejected
</span>
```

### Progress Bar
```jsx
<div className="w-full bg-neutral-200 rounded-full h-2">
  <div 
    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Stat Card
```jsx
<div className="p-4 bg-primary-50 rounded-lg border border-primary-200 shadow-xs hover:shadow-sm transition-shadow">
  <div className="flex items-center justify-between mb-2">
    <div className="text-2xl text-primary-600">📊</div>
    <div className="text-3xl font-bold text-primary-600">42</div>
  </div>
  <div className="text-sm text-neutral-600 font-medium">Active Items</div>
</div>
```

### Button
```jsx
// Primary
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium">
  Action
</button>

// Secondary
<button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 py-2 rounded-lg font-medium border border-neutral-200">
  Secondary
</button>

// Danger
<button className="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded-lg font-medium">
  Delete
</button>
```

---

## Utility Classes

### Text Colors
```
text-neutral-900      # Primary text (dark)
text-neutral-700      # Heading text
text-neutral-600      # Secondary text
text-neutral-500      # Tertiary text (lighter)

text-primary-600      # Success/Active
text-accent-600       # Links/Secondary action
text-warning-600      # Warning/Pending
text-error-600        # Errors/Danger
```

### Background Colors
```
bg-background-base    # White - main cards
bg-background-light   # Light gray - secondary containers
bg-background-hover   # Hover state

bg-primary-50         # Light success background
bg-accent-50          # Light blue background
bg-warning-50         # Light yellow background
bg-error-50           # Light red background

bg-neutral-100        # Light gray containers
bg-neutral-200        # Dividers, borders
```

### Borders
```
border-neutral-200    # Default border (most common)
border-neutral-300    # Stronger border
border-primary-200    # Primary highlight
border-warning-200    # Warning highlight
```

### Shadows
```
shadow-xs             # Subtle: 0 1px 2px
shadow-sm             # Default: 0 1px 3px (most cards)
shadow-md             # Medium: 0 4px 6px (hover state)
shadow-lg             # Large: 0 10px 15px (modals)
```

---

## Component Examples by Type

### Data Display
- Cards: `bg-background-base border border-neutral-200 shadow-sm`
- Lists: Items with `border-b border-neutral-100`
- Tables: Headers with `bg-neutral-50`, cells with `text-neutral-700`

### Status Indicators
- Green (#22c55e): Completed, Approved, Success
- Blue (#0ea5e9): In Progress, Active, Info
- Yellow (#f59e0b): Pending, Warning, Review
- Red (#ef4444): Rejected, Error, Overdue
- Gray (#e5e7eb): To Do, Default

### Interactive Elements
- Hover: Add `shadow-sm` or lighten background
- Focus: Use primary color for outline
- Disabled: Use `opacity-50` or `text-neutral-400`

---

## Common Color Combinations

| Element | BG | Text | Border |
|---------|----|----|--------|
| Success | `success-50` | `success-600` | `success-200` |
| Warning | `warning-50` | `warning-600` | `warning-200` |
| Error | `error-50` | `error-600` | `error-200` |
| Info | `accent-50` | `accent-600` | `accent-200` |
| Neutral | `neutral-100` | `neutral-700` | `neutral-200` |

---

## CSS Variables (for inline styles)

```css
var(--bg-base)              /* #FFFFFF */
var(--bg-light)             /* #F8F9FA */
var(--primary-color)        /* #22c55e */
var(--accent-color)         /* #0ea5e9 */
var(--warning-color)        /* #f59e0b */
var(--error-color)          /* #ef4444 */
var(--text-primary)         /* #111827 */
var(--text-secondary)       /* #6b7280 */
var(--neutral-200)          /* #e5e7eb */
var(--neutral-700)          /* #374151 */
```

---

## Tips for Consistency

1. **Always use `neutral-200` for borders** - It's the default subtle border
2. **Use `shadow-sm` for cards** - Matches design guidelines for soft shadows
3. **Traffic light system for status** - Green (good), Yellow (warning), Red (bad)
4. **Primary color for main CTAs** - Makes actions clear and scannable
5. **Proper text hierarchy** - Use `neutral-900` for headings, `neutral-600` for secondary
6. **Hover states** - Add `shadow-sm` or background color change
7. **Border radius** - Use `rounded-lg` for cards, `rounded` for inputs

---

## Common Mistakes to Avoid

❌ Using arbitrary colors instead of the palette  
✅ Use Tailwind utility classes (`bg-primary-500` not `bg-blue-500`)

❌ Heavy shadows on everything  
✅ Use `shadow-xs` or `shadow-sm` for most cases

❌ Bright, clashing status colors  
✅ Use the traffic light system (green, yellow, red)

❌ Poor text contrast  
✅ Dark text (`text-neutral-900`) on light backgrounds

❌ Inconsistent spacing  
✅ Use Tailwind spacing scale (p-4, gap-4, etc.)

---

## For More Info

- Full design guide: `DESIGN_SYSTEM.md`
- Applied styles summary: `DESIGN_TOKENS_APPLIED.md`
- Tailwind config: `tailwind.config.js`
- Global styles: `style.css`

---

## Support

For questions about the design system, refer to:
1. This guide (quick answers)
2. `DESIGN_TOKENS_APPLIED.md` (detailed info)
3. `DESIGN_SYSTEM.md` (comprehensive reference)
