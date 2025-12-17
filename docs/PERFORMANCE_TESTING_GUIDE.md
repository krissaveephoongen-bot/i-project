# Performance Testing Guide

## Quick Start - Verify Phase 1 Is Working

### Step 1: Test in Browser (5 minutes)
1. **Open your app** in browser
2. **Press F12** to open DevTools
3. **Go to Network tab**
4. **Reload the page** (Ctrl+R or Cmd+R)
5. **Look for API requests**:
   - Count how many API calls are made
   - Check if any are duplicates (should be fewer)
   - Look for cached responses (gray icons)

### Step 2: Check Console Logs (2 minutes)
1. **Open DevTools Console** (F12 → Console tab)
2. **Look for performance logs** like:
   ```
   ℹ️ pageLoad:App: 1234.56ms
   ```
3. **This shows your page load time** - should see multiple logs as you navigate

### Step 3: Use React Query DevTools (2 minutes)
1. **Look for "TanStack Query" button** in bottom-right corner
2. **Click to open React Query DevTools**
3. **See all queries** that have been cached
4. **Check stale vs fresh** - should mostly show fresh data

---

## Before/After Measurement

### Step 1: Record Baseline (Before Optimization)
Do this BEFORE implementing pagination:

**In DevTools Network tab:**
- [ ] Take screenshot showing API request count
- [ ] Note the total page load time
- [ ] Count number of requests for key pages:
  - Projects page: ___ requests
  - MyProjects page: ___ requests
  - Tasks page: ___ requests

**In DevTools Performance tab:**
1. Open Performance tab
2. Click the record button (red circle)
3. Reload page
4. Wait for page to fully load
5. Stop recording (click red button again)
6. Note: First Contentful Paint (FCP), Largest Contentful Paint (LCP)
   - FCP: ___ ms
   - LCP: ___ ms
   - Total Load: ___ ms

---

## Testing Pagination (After Implementation)

### Test Projects Page with Pagination

**Before changes:**
```
Browser Console: 50+ API calls total
Network tab shows: 5 "GET /api/projects" requests
Page load time: 3500ms
```

**After pagination:**
```
Browser Console: 20-30 API calls total
Network tab shows: 1-2 "GET /api/projects" requests
Page load time: 1200ms
```

### How to Test

1. **Open Projects page**
2. **Open DevTools → Network tab**
3. **Clear the network log** (click clear icon)
4. **Reload page**
5. **Wait for full load**
6. **Count API requests**:
   - Should be significantly fewer
   - Look for `/api/projects?page=1&pageSize=20` instead of `/api/projects` (all items)

---

## Performance Metrics to Track

### Core Web Vitals (Google's Key Metrics)

| Metric | Abbreviation | Good | Target |
|--------|--------------|------|--------|
| Largest Contentful Paint | LCP | < 2.5s | < 1.5s |
| First Contentful Paint | FCP | < 1.8s | < 1.2s |
| Cumulative Layout Shift | CLS | < 0.1 | < 0.05 |
| First Input Delay | FID | < 100ms | < 50ms |

**Where to find them:**
- DevTools → Performance tab → Record page load → Check the metrics
- Or Chrome Lighthouse: DevTools → Lighthouse → Analyze page load

### Application Metrics

| Metric | Measure | Current | Target |
|--------|---------|---------|--------|
| API Calls | Count in Network tab | ? | -40% |
| Initial Load | Total time to interactive | ? ms | < 1000ms |
| Cache Hit Rate | React Query DevTools | ? | > 80% |
| Memory Usage | Task Manager | ? MB | -50% |

---

## Testing Checklist

### Daily Testing (5 minutes)
- [ ] Open app in incognito/private window
- [ ] DevTools Network tab - count API requests
- [ ] Navigate between pages - should be fast
- [ ] Check console - no error messages
- [ ] Check for console performance logs

### Weekly Performance Audit (30 minutes)
- [ ] Run Lighthouse report (DevTools → Lighthouse)
- [ ] Record Web Vitals scores
- [ ] Compare to previous week
- [ ] Note any regressions
- [ ] Identify bottleneck pages

### Before/After Each Optimization
- [ ] Record baseline metrics
- [ ] Implement optimization
- [ ] Record new metrics
- [ ] Calculate improvement percentage
- [ ] Document findings

---

## How to Use the Performance Monitoring

### View all metrics in console:
```javascript
// In browser console:
// Get all recorded metrics
const { getMetricsSummary } = window.__PERF_MONITORING__ || {};
console.log(getMetricsSummary?.());

// This will show:
// - Total metrics recorded
// - Average duration
// - Slowest 5 operations
// - Any warnings/errors
```

### Monitor a specific operation:
```javascript
// Measurements will log to console automatically
// Look for logs like:
// ℹ️ pageLoad:Projects: 1234.56ms
// ⚠️ api:GET /api/projects: 2500ms (yellow = slow)
// ❌ api:GET /api/tasks: failed after 1000ms (red = error)
```

### Check Network Performance:
1. DevTools → Network tab
2. Look at "Type" column:
   - Blue icon = network request
   - Gray icon = cached response
   - Red = failed request
3. Sort by "Time" to see slowest requests
4. Check if same endpoint is called multiple times (should be avoided)

---

## Common Performance Issues & Fixes

### Issue: Too many API calls
**Check:**
- Is query staleTime too low? (check queryClient.ts)
- Is refetchOnWindowFocus set to true? (should be false)
- Are there duplicate requests? (could be mount issue)

**Fix:**
- Increase staleTime in queryClient.ts
- Ensure refetchOnWindowFocus is false
- Check for useEffect without dependency array

### Issue: Slow page load
**Check:**
- How many API requests? (should be < 5 initially)
- How many components rendering? (DevTools Performance tab)
- Are large lists rendering all items? (should use pagination)

**Fix:**
- Implement pagination
- Use virtual scrolling for large lists
- Add code splitting for routes

### Issue: Memory usage climbing
**Check:**
- How many cached queries? (React Query DevTools)
- Are you clearing old data? (check gcTime)
- Are there memory leaks? (DevTools Memory tab)

**Fix:**
- Reduce gcTime (garbage collection time)
- Implement pagination to limit data
- Check for proper cleanup in useEffect

---

## Tools & Resources

### Browser DevTools
- **Network tab**: See all API requests
- **Performance tab**: Profile page load, see LCP/FCP
- **Memory tab**: Check for memory leaks
- **Application tab**: See cache and storage

### React Tools
- **React Query DevTools**: See all cached queries
- **React DevTools**: Component hierarchy and re-renders
- **Chrome Performance Insights**: View Web Vitals

### Third-Party Tools
- **Chrome Lighthouse**: Overall performance score
- **WebPageTest**: Detailed waterfall analysis
- **GTmetrix**: Compare with industry benchmarks
- **Sentry**: Monitor production errors/performance

---

## Example: Full Testing Session

### Time: ~15 minutes

**Setup (2 min)**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open app in incognito window
3. Open DevTools (F12)
4. Go to Network tab
```

**Baseline (3 min)**
```
1. Click to Projects page
2. Record:
   - API request count: 47
   - Page load time: 3.2s
   - Console logs: see ℹ️ pageLoad:Projects: 3215ms
```

**Test Pagination (5 min)**
1. Implement pagination on Projects
2. Reload page
3. Record:
   - API request count: 12 (was 47, now -75%)
   - Page load time: 0.8s (was 3.2s, now -75%)
   - Console logs: see ℹ️ pageLoad:Projects: 812ms

**Analyze (2 min)**
```
✅ Success! 75% improvement
- Fewer API calls
- Faster load time
- Same features, better performance
```

**Document (3 min)**
- Update PERFORMANCE_IMPLEMENTATION_PROGRESS.md
- Add measurements
- Mark task as completed
- Move to next page

---

## Automation Ideas (Future)

1. **Performance Regression Testing**
   - Run tests on every deploy
   - Compare metrics to baseline
   - Fail build if regression > 10%

2. **Real User Monitoring (RUM)**
   - Collect metrics from real users
   - Identify slow pages in production
   - Alert on regressions

3. **Synthetic Monitoring**
   - Regular page load tests
   - Track metrics over time
   - Visualize trends in dashboard

---

## Success Criteria

After Phase 1 (React Query optimization + monitoring):
- [ ] See performance logs in console
- [ ] Verify 30-40% fewer API calls
- [ ] Verify cache hits (gray icons in Network tab)
- [ ] No errors in console

After Phase 2 (Pagination):
- [ ] Projects page loads in < 1 second
- [ ] 70% fewer API calls on pagination pages
- [ ] Smooth scrolling (60fps)
- [ ] Memory usage stable

After Phase 3 (Virtual scrolling + prefetch):
- [ ] 1000+ item lists remain responsive
- [ ] Navigation feels instant (prefetch)
- [ ] No memory leaks

After Phase 4 (Code splitting + backend optimization):
- [ ] Initial bundle < 100KB
- [ ] All Core Web Vitals green
- [ ] 3x faster than current state

---

## Questions?

Refer to:
- **PERFORMANCE_QUICK_START.md** - Quick reference
- **PERFORMANCE_OPTIMIZATION_GUIDE.md** - Deep dive
- **PERFORMANCE_IMPLEMENTATION_PROGRESS.md** - Status tracking

---

**Last Updated**: December 15, 2025
