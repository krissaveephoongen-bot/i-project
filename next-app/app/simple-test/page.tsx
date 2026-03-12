export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Test Page - No Layout</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Test</h2>
          <p className="text-gray-600 mb-4">
            This page bypasses all layouts and providers to test basic rendering.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✅ React is working</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">✅ Next.js is working</p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <p className="text-purple-800">✅ Tailwind CSS is working</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <ul className="space-y-2 text-gray-600">
            <li>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</li>
            <li>Time: {new Date().toLocaleString()}</li>
            <li>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'SSR'}</li>
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-500 hover:underline">
            Go to Main Page →
          </a>
        </div>
      </div>
    </div>
  );
}
