# Project Overview - Visual Style Guide

## Design System Overview

This guide documents the visual design system applied to the Project Overview page for consistency and future maintenance.

---

## Color Palette

### Primary Status Colors
```
Status Progress    #2563EB (Blue)        - Active work, actual progress
Status Success     #16A34A (Green)       - Completed work
Status Warning     #D97706 (Amber)       - Pending/waiting
Status Info        #0891B2 (Cyan)        - In progress
```

### Secondary Colors (Financial)
```
Budget Allocated   #64748B (Slate)       - Total budget
Budget Committed   #A855F7 (Purple)      - Funds allocated
Budget Spent       #DC2626 (Red)         - Actual costs
Budget Remaining   #10B981 (Green)       - Available funds
```

### Alert Colors
```
Alert Success      #10B981 (Green)       - SPI ≥ 1.0 (on track)
Alert Warning      #F59E0B (Amber)       - SPI < 1.0 (behind)
```

---

## Typography System

### Font Weights & Sizes

| Element | Size | Weight | Example |
|---------|------|--------|---------|
| Card Title | text-sm | medium | "ความคืบหน้าภาพรวม" |
| Main Value | text-3xl | bold | "45.2%" |
| Subtitle | text-xs | regular | "ความคืบหน้าจริง" |
| Progress % | text-sm | semibold | "75%" |

### Text Colors

| Context | Color Class | Usage |
|---------|-------------|-------|
| Main Values | text-[color]-600 | KPI and budget numbers |
| Labels | text-slate-600 | Card titles and descriptions |
| Subtitles | text-slate-500 | Context text below values |
| Descriptions | text-xs text-slate-500 | Helper text |

---

## Card Design System

### Card Components

#### Structure
```
┌─ Card (border-0 shadow-md hover:shadow-lg)
│
├─ CardHeader (border-b border-slate-100 pb-4)
│  └─ Icon + Title
│
└─ CardContent (min-h-[200px] pt-4)
   └─ Value + Subtitle
```

#### Styling Pattern
```tsx
<Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 
                  bg-gradient-to-br from-[color]-50/80 to-white">
  <CardHeader className="border-b border-slate-100 pb-4">
    <CardTitle className="flex items-center gap-2 text-slate-900">
      <div className="p-2 bg-[color]-100/80 rounded-lg">
        <IconComponent className="h-5 w-5 text-[color]-600" />
      </div>
      Title Text
    </CardTitle>
  </CardHeader>
  <CardContent className="min-h-[200px] pt-4">
    <div className="text-3xl font-bold text-[color]-600">Value</div>
    <p className="text-xs text-slate-500 mt-2">Subtitle</p>
  </CardContent>
</Card>
```

### Shadow Hierarchy

| Level | Class | Usage |
|-------|-------|-------|
| Base | shadow-sm | Default (unused in new design) |
| Hover | shadow-md | Interactive cards at rest |
| Active | shadow-lg | Cards on hover |

### Icon Treatment

#### Icon Container
```
Component: div
Classes: p-2 bg-[color]-100/80 rounded-lg
Example: p-2 bg-blue-100/80 rounded-lg
```

#### Icon Sizing
```
Size: h-5 w-5 (increased from h-4 w-4)
Color: text-[color]-600
Examples:
- text-blue-600 (progress)
- text-green-600 (completed)
- text-cyan-600 (in progress)
- text-amber-600 (pending)
```

---

## Grid Layout System

### KPI Cards & Budget Cards

```
Desktop (> 768px):     4 columns × 1 row
Tablet (648px-768px):  2 columns × 2 rows
Mobile (< 648px):      1 column × 4 rows

Spacing: gap-6 (24px)
Grid: grid grid-cols-1 md:grid-cols-4 gap-6
```

### Risk & Milestones

```
Desktop (> 768px):     2 columns × 1 row
Tablet (648px-768px):  2 columns × 1 row
Mobile (< 648px):      1 column × 2 rows

Spacing: gap-6 (24px)
Grid: grid grid-cols-1 md:grid-cols-2 gap-6
```

---

## S-Curve Chart Styling

### Chart Container
```
Background: bg-gradient-to-br from-slate-50/50 to-white
Padding: p-4
Border-radius: rounded-lg
Shadow: Inherited from parent Card
```

### Line Styling

#### Plan Line
```
Type: type="natural" (smooth curves)
Stroke: #94A3B8 (slate-400)
Style: strokeDasharray="5 5" (dashed)
Width: strokeWidth={2.5}
Hover: activeDot={{ r: 7, fill: '#94A3B8' }}
```

#### Actual Line
```
Type: type="natural" (smooth curves)
Stroke: #2563EB (blue-600)
Style: Solid
Width: strokeWidth={3}
Hover: activeDot={{ r: 7, fill: '#2563EB' }}
```

### Bar Styling

#### Milestone Bar
```
Fill: #A855F7 (purple-500)
Opacity: fillOpacity={0.8}
Size: barSize={24}
Radius: radius={[6, 6, 0, 0]}
```

### Legend Items
```
Item Layout: flex items-center gap-2
Font: text-sm text-slate-600 font-medium
Gap between items: gap-6
```

---

## Risk Items Styling

### Risk Item Container
```
Background: bg-gradient-to-r from-red-50/50 to-transparent
Border: border border-red-100/50
Hover: border-red-200
Border-radius: rounded-lg
Padding: p-3
Spacing: space-y-3
Transition: transition-colors
```

### Risk Severity Badge
```
High:   variant="destructive" (red)
Medium: variant="default" (gray-blue)
Low:    variant="secondary" (light gray)
```

---

## Milestone Items Styling

### Milestone Item Container
```
Spacing: space-y-1.5
Width: Full container width
```

### Progress Bar
```
Height: h-2.5 (increased from h-2)
Background: bg-slate-100
Filled: bg-blue-600 (progress color)
Border-radius: rounded-full
```

### Percentage Display
```
Font Size: text-sm
Font Weight: font-semibold
Color: text-blue-600
Position: Right-aligned
```

---

## SPI Alert Styling

### Container Styling (Conditional)

#### When SPI < 1.0 (Warning)
```
Background: bg-yellow-50/80
Border: border-l-4 border-yellow-400
Text Color: text-yellow-900
Subtitle Color: text-yellow-700
Indicator: bg-yellow-500
```

#### When SPI ≥ 1.0 (Success)
```
Background: bg-green-50/80
Border: border-l-4 border-green-400
Text Color: text-green-900
Subtitle Color: text-green-700
Indicator: bg-green-500
```

### Structure
```
┌─ Alert Container (flex items-start gap-3)
│
├─ Indicator Dot (w-2 h-2 rounded-full mt-1.5)
│
└─ Content Wrapper (flex-1)
   ├─ Status Line (text-sm font-medium)
   └─ Subtitle (text-xs mt-1)
```

---

## Transitions & Animations

### Hover Effects
```
Cards: 
  transition-shadow duration-300
  hover:shadow-lg

Risk Items:
  transition-colors (on hover)
  border-color change
```

### Chart Interactions
```
Line Animations:
  isAnimationActive={true}
  Smooth dot appearance on hover
  Duration: Automatic (Recharts default)
```

---

## Responsive Breakpoints

### Tailwind Breakpoints Used
```
sm:  640px   (not actively used in this design)
md:  768px   (primary breakpoint for layout changes)
lg:  1024px  (not used, but available)
xl:  1280px  (not used, but available)
```

### Layout Changes

#### At md: (768px)
- KPI Cards: 1 column → 4 columns
- Budget Cards: 1 column → 4 columns
- Risk/Milestones: 1 column → 2 columns
- Chart Legend: Vertical → Horizontal

---

## Component Integration Examples

### KPI Card Example
```tsx
<Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 
                  bg-gradient-to-br from-blue-50/80 to-white">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
    <CardTitle className="text-sm font-medium text-slate-600">
      ความคืบหน้าภาพรวม
    </CardTitle>
    <div className="p-2 bg-blue-100/80 rounded-lg">
      <TrendingUp className="h-5 w-5 text-blue-600" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-blue-600">
      {progress}%
    </div>
    <Progress value={progress} className="h-2 mt-3" />
    <p className="text-xs text-slate-500 mt-2">ความคืบหน้าจริง</p>
  </CardContent>
</Card>
```

### Risk Item Example
```tsx
<div className="flex items-center justify-between p-3 
                bg-gradient-to-r from-red-50/50 to-transparent 
                rounded-lg border border-red-100/50 
                hover:border-red-200 transition-colors">
  <span className="font-medium text-sm text-slate-700">
    {riskTitle}
  </span>
  <Badge variant={getSeverityVariant(severity)}>
    {severity}
  </Badge>
</div>
```

---

## Accessibility Notes

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Icons have semantic color meaning plus text labels
- Alert states use both color and text to convey meaning

### Typography
- Sufficient font sizes for readability
- Clear hierarchy with font-weight variations
- Semantic HTML structure maintained

### Interactive Elements
- Hover states clearly visible
- Touch targets adequate for mobile
- Focus states available for keyboard navigation

---

## Design Principles Applied

1. **Visual Hierarchy**: Larger, bolder values for important metrics
2. **Color Meaning**: Consistent semantic color coding across pages
3. **Whitespace**: Proper spacing prevents element collision
4. **Consistency**: Repeated patterns for predictability
5. **Accessibility**: Colors work for colorblind users
6. **Performance**: CSS-only animations, no JavaScript overhead

---

## Future Enhancements

Potential improvements for next iteration:
- Dark mode support with Tailwind dark: prefix
- Animation library integration (Framer Motion)
- Advanced chart interactions (Recharts advanced features)
- Custom tooltip styling for charts
- Loading skeleton states matching card design

---

**Last Updated**: February 18, 2025
**Version**: 1.0
**Status**: Production Ready
