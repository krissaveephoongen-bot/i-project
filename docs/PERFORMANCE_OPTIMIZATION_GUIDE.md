# Performance Optimization Guide - Data Loading Enhancement

## Overview
This guide provides strategies to optimize data loading performance across the application. The project already uses React Query, but there are significant optimization opportunities.

---

## 1. PRIORITY OPTIMIZATIONS

### 1.1 Implement Request Deduplication
**Problem**: Multiple simultaneous requests for same data
**Solution**: Leverage React Query's built-in deduplication

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 1.2 Parallel Data Loading
**Problem**: Sequential API calls delay page load
**Solution**: Use Promise.all or React Query parallel queries

```typescript
// BEFORE: Sequential
const projects = await fetchProjects();
const tasks = await fetchTasks(projects[0].id);
const expenses = await fetchExpenses(projects[0].id);

// AFTER: Parallel
const [projects, tasks, expenses] = await Promise.all([
  fetchProjects(),
  fetchTasks(projectId),
  fetchExpenses(projectId),
]);

// Or with React Query:
const projectsQuery = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});

const tasksQuery = useQuery({
  queryKey: ['tasks', projectsQuery.data?.[0]?.id],
  queryFn: () => fetchTasks(projectsQuery.data[0].id),
  enabled: !!projectsQuery.data?.[0]?.id, // Only run when dependencies exist
});
```

### 1.3 Implement Pagination & Lazy Loading
**Problem**: Loading all records at once causes memory bloat
**Solution**: Implement cursor-based or offset pagination

```typescript
// src/hooks/usePaginatedProjects.ts
import { useQuery } from '@tanstack/react-query';

interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export const usePaginatedProjects = ({ page, pageSize, search }: PaginationParams) => {
  return useQuery({
    queryKey: ['projects', { page, pageSize, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        ...(search && { search }),
      });
      const response = await fetch(`/api/projects?${params}`);
      return response.json();
    },
  });
};
```

### 1.4 Virtual Scrolling for Large Lists
**Problem**: Rendering 1000+ list items freezes UI
**Solution**: Use virtualization library

```bash
npm install react-window
```

```typescript
// src/components/VirtualizedProjectList.tsx
import { FixedSizeList } from 'react-window';

export const VirtualizedProjectList = ({ projects }: { projects: Project[] }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {projects[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={projects.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 1.5 Implement Infinite Query for Scroll Loading
**Problem**: Users load all data upfront
**Solution**: Progressive loading on scroll

```typescript
// src/hooks/useInfiniteProjects.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteProjects = () => {
  return useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/projects?offset=${pageParam}&limit=20`);
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  });
};

// Usage in component:
const { data, fetchNextPage, hasNextPage } = useInfiniteProjects();

return (
  <InfiniteScroll
    dataLength={data?.pages.flatMap(p => p.items).length || 0}
    next={fetchNextPage}
    hasMore={hasNextPage}
    loader={<Spinner />}
  >
    {data?.pages.map((page) =>
      page.items.map((project) => <ProjectCard key={project.id} {...project} />)
    )}
  </InfiniteScroll>
);
```

---

## 2. CODE SPLITTING & LAZY LOADING

### 2.1 Implement Route-Based Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Timesheet = lazy(() => import('./pages/Timesheet'));
const Expenses = lazy(() => import('./pages/Expenses'));

const Loader = () => <div>Loading...</div>;

export function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Suspense fallback={<Loader />}><Dashboard /></Suspense>} />
      <Route path="/projects" element={<Suspense fallback={<Loader />}><Projects /></Suspense>} />
      <Route path="/timesheet" element={<Suspense fallback={<Loader />}><Timesheet /></Suspense>} />
      <Route path="/expenses" element={<Suspense fallback={<Loader />}><Expenses /></Suspense>} />
    </Routes>
  );
}
```

### 2.2 Component-Level Code Splitting

```typescript
// Lazy load heavy components
const DetailPanel = lazy(() => import('./components/DetailPanel'));
const AdvancedChart = lazy(() => import('./components/AdvancedChart'));

export function ProjectDetail() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <button onClick={() => setShowDetails(true)}>Show Details</button>
      {showDetails && (
        <Suspense fallback={<Spinner />}>
          <DetailPanel />
        </Suspense>
      )}
    </>
  );
}
```

---

## 3. CACHING STRATEGIES

### 3.1 Configure Query Cache Intelligently

```typescript
// src/lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: {
        // Static data - cache longer
        'users': 1000 * 60 * 30, // 30 min
        // Dynamic data - cache shorter
        'projects': 1000 * 60 * 5, // 5 min
        // Real-time data - no cache
        'notifications': 0,
      },
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3.2 Manual Cache Management

```typescript
// Prefetch data when user hovers/focuses
const queryClient = useQueryClient();

const handleHover = (projectId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
  });
};

// Invalidate specific cache
const handleUpdate = async (projectId: string) => {
  await updateProject(projectId, data);
  await queryClient.invalidateQueries({
    queryKey: ['projects'],
  });
};
```

---

## 4. NETWORK OPTIMIZATION

### 4.1 Implement Request Compression & Minimal Payloads

```typescript
// src/services/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Accept-Encoding': 'gzip, deflate',
  },
});

// Request interceptor to add compression
apiClient.interceptors.request.use((config) => {
  // Only request needed fields
  if (!config.params) config.params = {};
  config.params.fields = 'id,name,status'; // Example: limit response fields
  return config;
});

export default apiClient;
```

### 4.2 Implement GraphQL (Optional, for advanced optimization)

```bash
npm install @apollo/client graphql
```

Benefits: Request only needed fields, single endpoint, batch queries

### 4.3 Add Request/Response Logging

```typescript
// src/lib/debug.ts
export const logPerformance = (operation: string, duration: number) => {
  if (duration > 1000) {
    console.warn(`⚠️ Slow operation: ${operation} took ${duration}ms`);
  }
};

// Usage
const start = performance.now();
const data = await fetchProjects();
logPerformance('fetchProjects', performance.now() - start);
```

---

## 5. DATABASE QUERY OPTIMIZATION

### 5.1 Implement Batch Queries

```typescript
// src/services/projectService.ts
export const fetchProjectsBatch = async (projectIds: string[]) => {
  // Instead of N requests, send 1 request with IDs
  const response = await apiClient.post('/api/projects/batch', {
    ids: projectIds,
  });
  return response.data;
};

// Usage
const projectIds = ['1', '2', '3', '4', '5'];
const projects = await fetchProjectsBatch(projectIds);
```

### 5.2 Add Aggregation Queries

```typescript
// Backend optimization
// BEFORE: Fetch projects, then loop to get stats
const projects = await db.project.findMany();
const stats = await Promise.all(projects.map(p => getProjectStats(p.id)));

// AFTER: Single query with aggregation
const projectsWithStats = await db.project.findMany({
  select: {
    id: true,
    name: true,
    _count: { select: { tasks: true, expenses: true } },
  },
});
```

---

## 6. MONITORING & PROFILING

### 6.1 Add Performance Monitoring

```typescript
// src/lib/monitoring.ts
import { useEffect } from 'react';

export const usePageLoadMetrics = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`📊 ${pageName} load time: ${duration.toFixed(2)}ms`);
      
      // Send to analytics service
      if (duration > 3000) {
        // Send alert to monitoring service
        logSlowPageLoad(pageName, duration);
      }
    };
  }, [pageName]);
};

// Usage in pages
export const Dashboard = () => {
  usePageLoadMetrics('Dashboard');
  // ... component code
};
```

### 6.2 Use React DevTools Profiler

```typescript
// Wrap expensive components
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

<Profiler id="ProjectTable" onRender={onRenderCallback}>
  <ProjectTable />
</Profiler>
```

---

## 7. INCREMENTAL RENDERING

### 7.1 Progressive Enhancement

```typescript
// Load skeleton first, then real data
export const ProjectCard = ({ projectId }: { projectId: string }) => {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
  });

  if (isLoading) return <ProjectCardSkeleton />;
  return <ProjectCardContent project={project} />;
};
```

### 7.2 Prioritize Critical Data

```typescript
// Load critical data immediately, defer non-critical
export const Dashboard = () => {
  // Critical: Load immediately
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Non-critical: Load after critical data
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    enabled: !!projects, // Only load after projects loaded
  });

  // Nice-to-have: Load in background
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    staleTime: Infinity, // Don't refetch unless explicitly invalidated
  });
};
```

---

## 8. IMPLEMENTATION CHECKLIST

- [ ] Configure query cache times appropriately
- [ ] Implement pagination for large lists
- [ ] Add virtual scrolling to lists with 50+ items
- [ ] Implement route-based code splitting
- [ ] Add lazy loading for heavy components
- [ ] Use `enabled` flag in dependent queries
- [ ] Prefetch data on hover/focus
- [ ] Add performance monitoring
- [ ] Optimize database queries (batch, aggregation)
- [ ] Implement infinite scroll where appropriate
- [ ] Add request/response compression
- [ ] Monitor Core Web Vitals
- [ ] Test with React DevTools Profiler

---

## 9. QUICK WINS (IMPLEMENT FIRST)

1. **Set proper staleTime/gcTime** in queryClient (2 hours)
2. **Add enabled flag** to dependent queries (2 hours)
3. **Implement pagination** on projects/tasks lists (4 hours)
4. **Add route-based code splitting** (3 hours)
5. **Add virtual scrolling** to large lists (3 hours)

---

## 10. PERFORMANCE TARGETS

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s
- **Page Load Time**: < 3s

---

## 11. ADDITIONAL RESOURCES

- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Web Vitals](https://web.dev/vitals/)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Performance Monitoring](https://web.dev/performance-monitoring/)
