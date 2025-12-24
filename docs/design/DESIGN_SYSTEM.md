# Design System - Professional SaaS Style

## Overview

This design system establishes consistent UI/UX patterns across the project management application using a professional, clean, and modern SaaS aesthetic.

### Core Principles

- **Professional**: Trustworthy, business-focused appearance
- **Clean**: Minimal clutter, maximum clarity
- **Modern**: Contemporary SaaS patterns and interactions
- **Accessible**: WCAG compliance and semantic HTML

---

## Color Palette

### Primary Colors (Deep Blue/Indigo)
Base color for CTAs, links, and primary interactions

| Level | Hex | Usage |
|-------|-----|-------|
| 50 | `#f0f4ff` | Backgrounds, highlights |
| 100 | `#e0e9ff` | Hover states |
| 200 | `#c1d3ff` | Secondary elements |
| 500 | `#6b7dff` | **Primary actions** |
| 600 | `#5566e6` | Hover state (primary) |
| 700 | `#4450cc` | Active state (primary) |
| 900 | `#222599` | Dark backgrounds |

### Neutral Colors (Grays)
Used for typography, borders, and surface variations

| Level | Hex | Usage |
|-------|-----|-------|
| 50 | `#f9fafb` | Page background, subtle hover |
| 100 | `#f3f4f6` | Card backgrounds |
| 200 | `#e5e7eb` | **Default borders** |
| 300 | `#d1d5db` | Dividers |
| 500 | `#6b7280` | Secondary text |
| 700 | `#374151` | Primary text |
| 900 | `#111827` | Darkest text |

### Status Colors

| Status | Hex | Usage |
|--------|-----|-------|
| Success/Completed | `#22c55e` | Completed tasks, approved items |
| Warning/Pending | `#f59e0b` | In progress, pending approval |
| Error/Overdue | `#ef4444` | Overdue, errors, deletions |

---

## Typography

### Font Family
- **Primary**: `Inter` (or system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`)
- **Sans-serif**, optimized for screen reading

### Font Sizes
| Size | Value | Usage |
|------|-------|-------|
| xs | 12px (0.75rem) | Helper text, captions |
| sm | 14px (0.875rem) | Labels, secondary content |
| base | 16px (1rem) | Body text |
| lg | 18px (1.125rem) | Section headers |
| xl | 20px (1.25rem) | Page titles |
| 2xl | 24px (1.5rem) | Main title |

### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, secondary headings |
| Semibold | 600 | Card titles, section headers |
| Bold | 700 | Main titles, emphasis |

---

## Spacing & Sizing

### Spacing Scale (8px base)
```
xs: 4px    (0.25rem)
sm: 8px    (0.5rem)
md: 16px   (1rem)
lg: 24px   (1.5rem)
xl: 32px   (2rem)
2xl: 40px  (2.5rem)
```

### Border Radius
| Size | Value | Usage |
|------|-------|-------|
| sm | 4px | Icon buttons, small badges |
| md | 6px | Form inputs |
| lg | 8px | **Default cards, buttons** |
| xl | 12px | Modal dialogs |
| full | 9999px | Badges, pills |

---

## Shadows

| Level | Value | Usage |
|-------|-------|-------|
| xs | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| sm | `0 1px 3px rgba(0,0,0,0.1)` | **Default cards** |
| md | `0 4px 6px rgba(0,0,0,0.1)` | Hovered cards |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| xl | `0 20px 25px rgba(0,0,0,0.1)` | Dropdowns, tooltips |

---

## Component Specifications

### Buttons

#### Primary Button
- **Background**: Primary 500 (`#6b7dff`)
- **Text**: White
- **Padding**: 12px 20px
- **Border Radius**: 8px
- **Hover**: Primary 600 (`#5566e6`)
- **Active**: Primary 700 (`#4450cc`)
- **Font Weight**: Medium (500)

```jsx
<Button
  type="primary"
  style={{ backgroundColor: COLORS.primary[500] }}
>
  Action
</Button>
```

#### Secondary Button
- **Background**: Neutral 100 (`#f3f4f6`)
- **Border**: 1px Neutral 300 (`#d1d5db`)
- **Text**: Neutral 700 (`#374151`)
- **Hover**: Neutral 200 background

#### Danger Button
- **Background**: Error 500 (`#ef4444`)
- **Text**: White
- **Hover**: Error 600 (`#dc2626`)

### Form Inputs

#### Text Input
- **Border**: 1px Neutral 200 (`#e5e7eb`)
- **Border Radius**: 6px
- **Padding**: 12px 16px
- **Font Size**: 16px
- **Focus**: 
  - Border color → Primary 500 (`#6b7dff`)
  - Box shadow: `0 0 0 3px rgba(107, 125, 255, 0.1)`

#### Placeholder Text
- **Color**: Neutral 400 (`#9ca3af`)
- **Font Weight**: Regular (400)

### Cards

- **Background**: White (`#ffffff`)
- **Border**: 1px Neutral 200 (`#e5e7eb`)
- **Border Radius**: 8px
- **Padding**: 24px
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)`
- **Hover**: 
  - Shadow → Medium level
  - Border color → Primary 200 (optional)

### Status Badge

Inline badge component for task/item status

```jsx
<StatusBadge status="in_progress" size="sm" />
```

#### Status Colors

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| to_do | Neutral 50 | Neutral 700 | ○ |
| in_progress | Primary 50 | Primary 700 | ▶ |
| pending | Warning 50 | Warning 700 | ⏱ |
| completed | Success 50 | Success 700 | ✓ |
| overdue | Error 50 | Error 700 | ⚠ |

### Progress Bar

Dual-layer progress indicator (planned vs. actual)

```jsx
<ProgressBar 
  planned={75} 
  actual={60} 
  showLabels={true} 
/>
```

- **Background**: Neutral 300 (`#d1d5db`)
- **Planned**: Gradient Primary 200 → Primary 300 (lighter)
- **Actual**: Gradient Primary 600 → Primary 500 (darker)
- **Height**: 8px (md), 4px (sm), 12px (lg)

---

## Consistency Guidelines

### For All Components

1. **Use the design tokens** from `src/constants/designSystem.ts`
2. **Follow spacing scale** - Always use multiples of 8px
3. **Maintain color hierarchy**:
   - Primary for main CTAs
   - Secondary/Neutral for supporting content
   - Status colors for semantic meaning
4. **Consistent font sizing** - Never use arbitrary sizes
5. **Rounded corners** - Use predefined border-radius values

### Table Layout

- **Header Row**: 
  - Background: Neutral 50 (`#f9fafb`)
  - Font Weight: Semibold (600)
  - Font Size: 14px
  - Text Transform: Uppercase (optional)
  - Letter Spacing: 0.05em

- **Body Row**:
  - Border Bottom: 1px Neutral 200
  - Hover: Background Neutral 50
  - Transition: 0.2s ease-in-out

- **Cell Padding**: 16px vertical, 16px horizontal

### Modal Dialog

- **Width**: 700px (desktop)
- **Border Radius**: 12px
- **Header Padding**: 24px
- **Body Padding**: 24px
- **Footer**: Buttons right-aligned

---

## Implementation Files

- **Constants**: `src/constants/designSystem.ts`
- **Tailwind Config**: `tailwind.config.js`
- **Global Styles**: `src/index.css`
- **Component Modules**: `src/components/*/[Component].module.css`

### Using Design Tokens in Components

```tsx
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/designSystem';
import styles from './MyComponent.module.css';

export const MyComponent = () => (
  <div style={{ color: COLORS.text.primary, padding: SPACING.lg }}>
    {/* Content */}
  </div>
);
```

---

## Accessibility

- ✓ Color contrast ratios meet WCAG AA standards
- ✓ Semantic HTML elements
- ✓ ARIA labels for interactive components
- ✓ Focus indicators visible on all interactive elements
- ✓ Keyboard navigation support
- ✓ Reduced motion support via `prefers-reduced-motion`

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide desktop |

### Mobile-First Approach
All components are designed mobile-first, with responsive enhancements for larger screens.

---

## Future Enhancements

- Dark mode variants (via CSS custom properties)
- Animation library for transitions
- Loading states and skeletons
- Empty states and error illustrations
- Toast/notification styling system
