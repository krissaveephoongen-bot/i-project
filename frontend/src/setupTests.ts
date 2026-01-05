// Vitest setup: provide a default QueryClient for tests to avoid
// "No QueryClient set" errors when hooks call useQueryClient.
import { QueryClient } from '@tanstack/react-query';

// Single shared test client (cleared between tests)
const TEST_QUERY_CLIENT = new QueryClient({ defaultOptions: { queries: { retry: false } } });

// Clear query cache between tests
beforeEach(() => {
  try {
    TEST_QUERY_CLIENT.clear();
  } catch (err) {
    // ignore
  }
});

// Mock useQueryClient to return our test client when a provider is not present
// This avoids needing to wrap every render with QueryClientProvider in tests
// while keeping the real implementations of other react-query exports.
import { vi } from 'vitest';

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQueryClient: () => TEST_QUERY_CLIENT,
  } as any;
});

// Wrap React Testing Library's render and renderHook so all renders are
// automatically wrapped with a QueryClientProvider. This prevents tests
// from needing to add the provider in every file.
vi.mock('@testing-library/react', async (importOriginal) => {
  const actual = await importOriginal();
  const { QueryClientProvider } = await import('@tanstack/react-query');

  function AllProviders({ children }: any) {
    return <QueryClientProvider client={TEST_QUERY_CLIENT}>{children}</QueryClientProvider>;
  }

  return {
    ...actual,
    render: (ui: any, options: any) => actual.render(ui, { wrapper: AllProviders, ...options }),
    renderHook: (hook: any, options: any) => actual.renderHook(hook, { wrapper: AllProviders, ...options }),
  };
});
