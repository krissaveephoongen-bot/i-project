# 🎨 UI/UX Design Reference Guide

## Visual Design System

### Color Palette

#### Primary Colors
- **Blue:** `#2563eb` - Main brand color, active states
- **Light Blue:** `#dbeafe` - Hover states, backgrounds
- **Dark Blue:** `#1e40af` - Text, accents

#### Semantic Colors
| Color | Usage | Light | Dark |
|-------|-------|-------|------|
| Green | Success, Available, On Track | `#10b981` | `#34d399` |
| Yellow | Warning, At Risk, Caution | `#f59e0b` | `#fbbf24` |
| Orange | Medium Risk | `#f97316` | `#fb923c` |
| Red | Critical, Error, Danger | `#ef4444` | `#f87171` |
| Purple | Secondary accent | `#a855f7` | `#d946ef` |
| Cyan | Tertiary accent | `#06b6d4` | `#22d3ee` |
| Gray | Neutral, disabled | `#6b7280` | `#9ca3af` |

---

## Component Design Patterns

### 1. Cards
```
┌─────────────────────────────────┐
│ HEADER (title, badges)          │
├─────────────────────────────────┤
│ CONTENT (main info)             │
│                                 │
├─────────────────────────────────┤
│ FOOTER (actions, info)          │
└─────────────────────────────────┘
```

**Features:**
- Box shadow on hover
- Rounded corners (8px)
- Padding: 24px
- Smooth transitions

### 2. Metric Cards
```
┌──────────────────────────────┐
│ Label         📊 Icon        │
│ 1,234                        │
│ +12% from last month         │
└──────────────────────────────┘
```

**Features:**
- Gradient background
- Large number display
- Trend indicator
- Icon for visual context

### 3. Progress Bars
```
────────────────────────────────
│████████░░░░░░░░░░░░░░│ 45%
────────────────────────────────
```

**Features:**
- Rounded ends
- Color coded by progress
- Percentage label
- Smooth transitions

### 4. Status Badges
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ✓ Available │  │ ⚠ At Risk   │  │ ✗ Critical  │
└─────────────┘  └─────────────┘  └─────────────┘
Green            Yellow            Red
```

**Features:**
- Icon + text
- Rounded pills
- Semantic colors
- Font weight: semibold

---

## Navigation Design

### Sidebar Menu Structure

#### Desktop View (≥1024px)
```
┌──────────────────┐
│ ▼ PM v2.0      │
├──────────────────┤
│ 🏠 Home         │
│ 📈 Dashboard    │
│ 📁 Projects ▼   │
│  ├ All Projects │
│  ├ Project Tbl  │
│  ├ Create       │
│  └ My Projects  │
│ 👥 Resources ▼  │
│ ⏱️ Time & Exp ▼ │
│ 📊 Analytics ▼  │
│ 🏢 Organization▼│
│ ⭐ Favorites   │
│ ⚙️ Settings    │
│ 👨‍💼 Admin ▼     │
├──────────────────┤
│ 👤 User Name    │
│    user@email   │
└──────────────────┘
```

#### Mobile View (<1024px)
```
┌─────────────────────────┐
│ ☰ | Title | ⟴ |         │
├─────────────────────────┤
│ [Overlay (semi-trans)]  │
│ ┌───────────────────┐   │
│ │ Sidebar Content   │   │
│ │ (slides from left)│   │
│ │                   │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

### Menu Item Styling

**Inactive State:**
- Background: Transparent
- Text: Gray
- Hover: Light gray background

**Active State:**
- Background: Light blue (`#eff6ff`)
- Text: Blue (`#2563eb`)
- Icon: Blue
- Shadow: Subtle

**Hover State:**
- Background: Slightly darker gray
- Transition: 200ms
- Cursor: Pointer

---

## Typography Scale

| Level | Font Size | Weight | Line Height | Usage |
|-------|-----------|--------|-------------|-------|
| H1 | 30px | Bold (700) | 1.2 | Page titles |
| H2 | 24px | Bold (700) | 1.3 | Section titles |
| H3 | 20px | Semibold (600) | 1.4 | Subsection |
| Body | 14px | Regular (400) | 1.5 | Body text |
| Label | 12px | Regular (400) | 1.5 | Form labels |
| Caption | 12px | Medium (500) | 1.4 | Captions |
| Code | 13px | Regular (400) | 1.5 | Code blocks |

---

## Spacing System

```
Spacing Scale: 4px base unit

2px   → 0.5 unit (minimal)
4px   → 1 unit (tight)
8px   → 2 units
12px  → 3 units
16px  → 4 units (standard)
20px  → 5 units
24px  → 6 units (padding)
32px  → 8 units
40px  → 10 units
48px  → 12 units (section margin)
```

**Usage:**
- Padding inside components: 16-24px
- Margin between sections: 24-48px
- Gap between grid items: 16-24px
- Icon spacing: 8-12px

---

## Dark Mode Design

### Background Colors
| Element | Light | Dark |
|---------|-------|------|
| Surface | `#ffffff` | `#111827` |
| Elevated | `#f9fafb` | `#1f2937` |
| Secondary | `#f3f4f6` | `#374151` |
| Hover | `#e5e7eb` | `#4b5563` |

### Text Colors
| Type | Light | Dark |
|------|-------|------|
| Primary | `#111827` | `#f3f4f6` |
| Secondary | `#6b7280` | `#9ca3af` |
| Disabled | `#d1d5db` | `#6b7280` |

### Border Colors
| Type | Light | Dark |
|------|-------|------|
| Default | `#e5e7eb` | `#374151` |
| Subtle | `#f3f4f6` | `#1f2937` |

---

## Animation & Transitions

### Durations
- Quick: 150ms (buttons, hovers)
- Normal: 200ms (transitions)
- Smooth: 300ms (page changes)
- Slow: 500ms (modals, large changes)

### Easing Functions
- `ease-out` - Snappy interactions
- `ease-in-out` - Smooth transitions
- `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design standard

### Effects

**Fade In/Out:**
```
opacity: 0 → 1
duration: 200ms
```

**Slide Down (Submenu):**
```
height: 0 → auto
opacity: 0 → 1
duration: 200ms
```

**Hover Lift (Cards):**
```
transform: translateY(0) → translateY(-4px)
boxShadow: sm → lg
duration: 200ms
```

---

## Responsive Breakpoints

```
┌─ Mobile          ─ Tablet           ─ Desktop      ─ Wide    ─┐
│ <640px           640px-1024px       1024px-1280px  1280px+   │
└─────────────────────────────────────────────────────────────┘

sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Layout Adjustments
- **Mobile:** 1 column, full width, hamburger menu
- **Tablet:** 2 columns, sidebar collapsed
- **Desktop:** 2-3 columns, full sidebar
- **Wide:** 4+ columns, expanded sidebar

---

## Icon System

### Icon Library
Using **lucide-react** icons:

| Category | Icons |
|----------|-------|
| Navigation | Home, Menu, ChevronDown, ChevronUp, etc. |
| Business | FolderKanban, Users, DollarSign, BarChart3, etc. |
| Status | CheckCircle, AlertCircle, AlertTriangle, etc. |
| Actions | Plus, Edit2, Trash2, Archive, Eye, etc. |
| Data | TrendingUp, TrendingDown, Clock, Calendar, etc. |

### Icon Sizing
- **Navigation:** 20-24px
- **Buttons:** 16-20px
- **Inline:** 16px
- **Decorative:** 12-16px

---

## Form Elements

### Input Fields
```
┌─────────────────────────────┐
│ Label                      │
│ ┌──────────────────────┐   │
│ │ Placeholder text     │   │
│ └──────────────────────┘   │
│ Helper text or error      │
└─────────────────────────────┘
```

**States:**
- Default: Gray border
- Focus: Blue border, shadow
- Error: Red border, error message
- Disabled: Gray background, disabled opacity

### Buttons

#### Primary Button
```
┌──────────────────┐
│ Primary Action   │
└──────────────────┘
Background: Blue, Hover: Darker Blue
```

#### Secondary Button
```
┌──────────────────┐
│ Secondary Action │
└──────────────────┘
Background: Light Gray, Border: Gray
```

#### Tertiary Button
```
┌──────────────────┐
│ Tertiary Action  │
└──────────────────┘
Text: Blue, Hover: Light Blue Background
```

---

## Data Table Design

```
┌──────────┬──────────┬──────────┬──────────┐
│ Column 1 │ Column 2 │ Column 3 │ Column 4 │
├──────────┼──────────┼──────────┼──────────┤
│ Data 1   │ Data 2   │ Data 3   │ Data 4   │
│ Data 1   │ Data 2   │ Data 3   │ Data 4   │
│ Data 1   │ Data 2   │ Data 3   │ Data 4   │
└──────────┴──────────┴──────────┴──────────┘
```

**Features:**
- Alternating row hover
- Sortable columns with indicators
- Responsive horizontal scroll
- Clear header styling
- Consistent padding

---

## Chart Design

### Bar Chart
- Gradient color from dark to light
- Rounded bar ends
- Tooltip on hover
- Responsive sizing

### Pie Chart
- Distinct colors per segment
- Center label display
- Smooth animations
- Legend below

---

## Accessibility

### Contrast Ratios
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Components: 3:1 minimum

### Focus States
- Visible focus ring: 2px
- Color: Blue (`#2563eb`)
- Offset: 2px

### Keyboard Navigation
- Tab order: logical flow
- Escape: close modals/menus
- Enter: confirm actions
- Arrow keys: navigate lists

---

## Dark Mode Implementation

### CSS Variables (Example)
```css
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
  --color-border: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #111827;
    --color-text-primary: #f3f4f6;
    --color-border: #374151;
  }
}
```

### Tailwind Dark Mode
```jsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

---

## Best Practices

✅ **Consistency**
- Use same spacing throughout
- Consistent icon sizes
- Standard colors for states

✅ **Clarity**
- Clear visual hierarchy
- Obvious interactive elements
- Clear status indicators

✅ **Performance**
- Optimize images
- Lazy load components
- Use CSS for animations

✅ **Accessibility**
- Sufficient contrast
- Keyboard navigation
- Screen reader support
- ARIA labels

---

## Component Library Used

- **UI Components:** Custom built on shadcn/ui
- **Icons:** lucide-react
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS
- **Charts:** Custom ProjectChart component

---

**Last Updated:** December 2024
**Version:** 2.0
**Status:** Complete Design System
