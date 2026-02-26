export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          404: Page Not Found
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
