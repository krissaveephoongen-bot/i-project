# Bundle Optimization Guide

## Current Status

### Large Dependencies
- `antd` - ~900KB gzipped
- `@mui/material` - ~400KB gzipped  
- `recharts` - ~350KB gzipped
- `html2canvas` - ~250KB gzipped
- `jspdf` - ~180KB gzipped

**Total**: ~2.1 MB gzipped

---

## Optimization Strategies

### 1. Dynamic Imports (High Impact)
```typescript
// ❌ BEFORE: Bundled in main chunk
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function exportToPDF() {
  return new Promise(async (resolve) => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    // ... export logic
  });
}

// ✅ AFTER: Loaded on demand
const exportToPDF = async () => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  // ... export logic
};
```

### 2. Antd Component Tree Shaking
```typescript
// ❌ BEFORE: Imports entire library
import { Button, Modal, Table, Form } from 'antd';

// ✅ AFTER: Tree-shake individual components (if using babel plugin)
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Table from 'antd/lib/table';
import Form from 'antd/lib/form';
```

### 3. Replace Recharts with Lighter Alternative
```typescript
// Consider: visx, chart.js, or nivo for specific charts
// Recharts is 350KB - could be replaced with a lighter library for specific use cases

import { LineChart } from 'recharts';  // 350KB
// vs
import { ChartContainer } from '@visx/shape'; // 50KB
```

### 4. Code Splitting for Routes
```typescript
// ✅ Next.js automatically splits pages
// Ensure each route-level component is optimized

// In next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};
```

### 5. Remove Duplicate Dependencies
```json
{
  "dependencies": {
    "antd": "^5.0.0",           // 900KB
    "@mui/material": "^5.0.0",  // 400KB - DUPLICATE!
    "shadcn-ui": "custom",      // 50KB - LIGHTWEIGHT
  }
}
```

**Recommendation**: Use only one UI library
- **antd** for complex tables/data
- **shadcn-ui** for simple components

---

## Measurement

### 1. Using Next.js Bundle Analyzer
```bash
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});

# Run analysis
ANALYZE=true npm run build
```

### 2. Using webpack-bundle-analyzer
```bash
npm install --save-dev webpack-bundle-analyzer

# Create a webpack config and analyze
```

### 3. Chrome DevTools
- Open DevTools → Coverage tab
- Record coverage while using the app
- Identifies unused JavaScript

---

## Performance Targets

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Main Bundle | ~900KB | ~500KB | ? |
| First Contentful Paint | ~3s | ~1.5s | ? |
| Largest Contentful Paint | ~4s | ~2.5s | ? |
| Time to Interactive | ~6s | ~3s | ? |

---

## Recommended Actions

### Immediate (High Impact, Low Effort)
1. ✅ Dynamic import html2canvas/jsPDF
   - **Impact**: -230KB
   - **Effort**: 30 min
   - **Status**: READY

2. ✅ Remove unused UI library
   - **Impact**: -400KB (if removing @mui)
   - **Effort**: 2 hours
   - **Status**: NEEDS AUDIT

3. ✅ Enable SWC minification
   - **Impact**: -100KB
   - **Effort**: 10 min
   - **Status**: READY

### Medium (Medium Impact, Medium Effort)
4. 📋 Split Recharts usage
   - **Impact**: -200KB
   - **Effort**: 4 hours
   - **Status**: ANALYSIS NEEDED

5. 📋 Optimize antd imports
   - **Impact**: -150KB
   - **Effort**: 2 hours
   - **Status**: RESEARCH NEEDED

### Long-term (Low Impact, High Effort)
6. 📋 Migrate to lighter UI solution
   - **Impact**: -500KB
   - **Effort**: 20+ hours
   - **Status**: FUTURE

---

## Monitoring

### 1. Set Up Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
```

### 2. Bundle Size Tracking
- Add to CI/CD pipeline
- Alert if bundle size increases > 10%

---

## Next Steps

1. **Today**: Implement dynamic imports (30 min, -230KB)
2. **This Week**: Audit UI library usage (2h, -400KB potential)
3. **This Month**: Consider Recharts replacement (4h, -200KB potential)

**Target**: Reduce bundle from 2.1MB to ~1.3MB (38% reduction)

---

## Resources

- [Next.js Performance Guide](https://nextjs.org/docs/advanced-features/performance-optimization)
- [Bundle Analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
- [Web Vitals](https://web.dev/vitals/)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
