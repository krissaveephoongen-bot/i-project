import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSpinner } from "../components/ui/loading";

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, reset }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div className="text-red-500 mb-4">
      <svg
        className="w-12 h-12 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h2>
    <p className="text-gray-600 mb-4">
      {error.message || "Failed to load component"}
    </p>
    <button
      onClick={reset}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

// Dynamic imports with loading and error handling
export const WeeklyActivities = dynamic(
  () => import("../components/WeeklyActivities"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const ProjectDetails = dynamic(
  () => import("../components/ProjectDetails"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const TaskList = dynamic(() => import("../components/TaskList"), {
  loading: LoadingFallback,
  ssr: false,
});

export const TimesheetList = dynamic(
  () => import("../components/TimesheetList"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const UserManagement = dynamic(
  () => import("../components/UserManagement"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const Reports = dynamic(() => import("../components/Reports"), {
  loading: LoadingFallback,
  ssr: false,
});

export const Dashboard = dynamic(() => import("../components/Dashboard"), {
  loading: LoadingFallback,
  ssr: true, // Dashboard can be server-side rendered
});

// Chart components (heavy components)
export const FinancialChart = dynamic(
  () => import("../components/FinancialChart"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const ProjectChart = dynamic(
  () => import("../components/ProjectChart"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const TeamLoadChart = dynamic(
  () => import("../components/TeamLoadChart"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

// Form components
export const ProjectForm = dynamic(() => import("../components/ProjectForm"), {
  loading: LoadingFallback,
  ssr: false,
});

export const TaskForm = dynamic(() => import("../components/TaskForm"), {
  loading: LoadingFallback,
  ssr: false,
});

export const UserForm = dynamic(() => import("../components/UserForm"), {
  loading: LoadingFallback,
  ssr: false,
});

// Modal components
export const QuickLogModal = dynamic(
  () => import("../components/QuickLogModal"),
  {
    loading: () => null, // Modals don't need loading states
    ssr: false,
  },
);

export const TaskFormDialog = dynamic(
  () => import("../components/TaskFormDialog"),
  {
    loading: () => null,
    ssr: false,
  },
);

// Admin components
export const AdminDashboard = dynamic(
  () => import("../components/AdminDashboard"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

export const SystemSettings = dynamic(
  () => import("../components/SystemSettings"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

// Utility function for lazy loading with custom loading component
export function createLazyComponent(
  importFunc,
  loadingComponent = LoadingFallback,
  options = {},
) {
  return dynamic(importFunc, {
    loading: loadingComponent,
    ssr: false,
    ...options,
  });
}

// HOC for error boundaries
export function withErrorBoundary(WrappedComponent) {
  return function WithErrorBoundary(props) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <WrappedComponent {...props} />
      </Suspense>
    );
  };
}
