import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { actualTheme } = useTheme();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      actualTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Navigation */}
      <nav className={`${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">ProjectHub</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/auth/login')}
                className={`px-6 py-2 font-medium rounded-lg transition ${
                  actualTheme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-700'
                    : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-5xl font-bold mb-6 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Manage Projects Like Never Before
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Streamline your workflow, collaborate with your team, and deliver projects on time with our powerful project management platform.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className={`p-8 rounded-lg transition transform hover:scale-105 hover:shadow-lg ${
            actualTheme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white shadow-md'
          }`}>
            <div className="text-indigo-600 text-4xl mb-4">📊</div>
            <h3 className={`text-xl font-semibold mb-3 ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Dashboard</h3>
            <p className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Get a complete overview of all your projects and tasks at a glance.
            </p>
          </div>

          <div className={`p-8 rounded-lg transition transform hover:scale-105 hover:shadow-lg ${
            actualTheme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white shadow-md'
          }`}>
            <div className="text-indigo-600 text-4xl mb-4">👥</div>
            <h3 className={`text-xl font-semibold mb-3 ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Team Collaboration</h3>
            <p className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Work seamlessly with your team and keep everyone on the same page.
            </p>
          </div>

          <div className={`p-8 rounded-lg transition transform hover:scale-105 hover:shadow-lg ${
            actualTheme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white shadow-md'
          }`}>
            <div className="text-indigo-600 text-4xl mb-4">📈</div>
            <h3 className={`text-xl font-semibold mb-3 ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Analytics & Reports</h3>
            <p className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Track progress and generate detailed reports for better insights.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-20 ${actualTheme === 'dark' ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-900'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-400">
            © 2024 ProjectHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
