# Design System Quick Reference

## Color Palette Cheat Sheet

### Primary (Deep Blue/Indigo)
```
#6b7dff - Primary actions, links, CTAs
#f0f4ff - Backgrounds, highlights
#5566e6 - Hover state
```

### Neutral (Grays)
```
#1f2937 - Main text
#6b7280 - Secondary text
#e5e7eb - Borders, dividers
#f9fafb - Page background
```

### Status
```
#22c55e - Success/Completed
#f59e0b - Warning/Pending  
#ef4444 - Error/Overdue
```

---

## Quick Import

```tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/designSystem';
import { StatusBadge, ProgressBar } from '@/components/ui';
```

---

## Common Usage

### Button
```jsx
<Button style={{ backgroundColor: COLORS.primary[500] }}>
  Action
</Button>
```

### Input
```jsx
<Input 
  style={{ borderColor: COLORS.border }}
  placeholder="Enter..."
/>
```

### Status Badge
```jsx
<StatusBadge status="in_progress" size="md" />
// Statuses: todo, in_progress, pending, completed, overdue, done
```

### Progress Bar
```jsx
<ProgressBar planned={75} actual={60} showLabels={true} />
```

### Card
```jsx
<div style={{
  backgroundColor: COLORS.background,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '8px',
  padding: SPACING.lg,
  boxShadow: SHADOWS.sm,
}}>
  Content
</div>
```

---

## Spacing Utilities

```
SPACING.xs   = 4px
SPACING.sm   = 8px
SPACING.md   = 16px    ← Default padding
SPACING.lg   = 24px    ← Cards, sections
SPACING.xl   = 32px
SPACING.2xl  = 40px
```

---

## Font Sizes

```
TYPOGRAPHY.fontSize.xs   = 12px  (small labels)
TYPOGRAPHY.fontSize.sm   = 14px  (label text)
TYPOGRAPHY.fontSize.base = 16px  (body text)
TYPOGRAPHY.fontSize.lg   = 18px  (headers)
TYPOGRAPHY.fontSize.xl   = 20px  (section titles)
TYPOGRAPHY.fontSize.2xl  = 24px  (main title)
```

---

## Border Radius

```
sm  = 4px   (small elements)
md  = 6px   (form inputs)
lg  = 8px   (default cards, buttons)
xl  = 12px  (modals)
full = circular
```

---

## Shadows

```
xs = subtle (1px)
sm = default (2px)
md = elevated (medium)
lg = floating (large)
xl = dropdown (extra large)
```

---

## Status Badge Reference

| Status | Icon | Color |
|--------|------|-------|
| todo | ○ | Gray |
| in_progress | ▶ | Blue |
| pending | ⏱ | Orange |
| completed | ✓ | Green |
| overdue | ⚠ | Red |
| done | ✓ | Green |

---

## Component Size Guide

### Button
- Small: 8px padding
- Medium: 12px padding (default)
- Large: 16px padding

### Input
- Default: 12px padding
- Focus: Blue border + shadow

### Badge
- Small: 6px padding
- Medium: 8px padding (default)
- Large: 12px padding

### Card
- Default: 24px padding
- Max width: responsive to container

---

## Typography Stack

```
Font: Inter (system fallback)
Weight: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
Line height: 1.5 (normal)
Letter spacing: normal, 0.05em (uppercase headers)
```

---

## Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

---

## Focus & Hover States

### Input Focus
```css
border-color: #6b7dff
box-shadow: 0 0 0 3px rgba(107, 125, 255, 0.1)
```

### Button Hover
```css
Primary:   #6b7dff → #5566e6
Secondary: #f3f4f6 → #e5e7eb
Danger:    #ef4444 → #dc2626
```

### Link Hover
```css
color: #6b7dff
text-decoration: underline
```

---

## Common Patterns

### Form Container
```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.lg }}>
  <Form.Item>...</Form.Item>
  <Form.Item>...</Form.Item>
</div>
```

### Status Display
```jsx
<StatusBadge status={task.status} size="sm" />
```

### Progress Tracking
```jsx
<ProgressBar 
  planned={task.weight} 
  actual={task.progress}
  size="md"
/>
```

### Confirmation Dialog
```jsx
<Popconfirm 
  title="Confirm Action"
  description="Are you sure?"
  okButtonProps={{ danger: true }}
  onConfirm={handleConfirm}
>
  <Button danger>Delete</Button>
</Popconfirm>
```

---

## Do's ✓

- ✓ Use design tokens instead of hardcoded colors
- ✓ Follow 8px spacing scale
- ✓ Use predefined component sizes
- ✓ Add focus indicators on interactive elements
- ✓ Test color contrast (4.5:1 minimum)
- ✓ Use StatusBadge for all status displays
- ✓ Leverage CSS modules for scoped styles

---

## Don'ts ✗

- ✗ Don't use arbitrary colors not in palette
- ✗ Don't add random padding/margin
- ✗ Don't skip focus states
- ✗ Don't inline style when CSS class exists
- ✗ Don't use status as only visual indicator
- ✗ Don't duplicate status styling code
- ✗ Don't assume color accessibility

---

## File Locations

| Item | Location |
|------|----------|
| Design Tokens | `src/constants/designSystem.ts` |
| StatusBadge | `src/components/ui/StatusBadge.tsx` |
| ProgressBar | `src/components/ui/ProgressBar.tsx` |
| Task Component | `src/components/tasks/TaskManagement.tsx` |
| Task Styles | `src/components/tasks/TaskManagement.module.css` |
| Design Doc | `DESIGN_SYSTEM.md` |
| Implementation Guide | `UI_REFACTORING_GUIDE.md` |

---

## Quick Fixes

### "How do I change the primary color?"
→ Edit `COLORS.primary` in `src/constants/designSystem.ts`

### "How do I add a new status?"
→ Add entry to `STATUS_CONFIG` in `designSystem.ts`

### "Colors not consistent?"
→ Check if using `COLORS` from design tokens, not hardcoded

### "Want new form spacing?"
→ Adjust `SPACING` constants, or use Tailwind's `gap-4`, `p-6`, etc.

### "Button style wrong?"
→ Use `COLORS.primary[500]` for background, ensure focus state

---

## Testing Checklist

- [ ] Colors match palette (use hex picker)
- [ ] Spacing uses 8px scale
- [ ] Text contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Responsive on mobile/tablet/desktop
- [ ] Consistent across similar components
- [ ] No hardcoded colors in components

---

For detailed information, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
