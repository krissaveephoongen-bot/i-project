import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  TrendingUp,
  CheckCircle,
  Zap,
  Shield,
  Smartphone,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-blue-600">
            <span className="text-white text-2xl font-bold">PM</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Project Management Made Simple
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your projects, collaborate with your team, and deliver results faster with our comprehensive project management platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/menu')}>
              Explore Features
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Core Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Get a comprehensive overview of all your projects and key metrics at a glance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <FolderKanban className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Project Management</h3>
                <p className="text-sm text-gray-600">
                  Create, track, and manage projects with detailed budgets and team assignments.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Resource Management</h3>
                <p className="text-sm text-gray-600">
                  Allocate resources efficiently and track team capacity across projects.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">
                  Generate detailed reports and gain insights into project performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Our Platform</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Easy to Use',
                description: 'Intuitive interface that requires minimal training and setup.',
              },
              {
                icon: Zap,
                title: 'Fast & Reliable',
                description: 'Lightning-fast performance with enterprise-grade reliability.',
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Enterprise-level security with role-based access control.',
              },
              {
                icon: Smartphone,
                title: 'Mobile Ready',
                description: 'Manage projects on the go with our responsive design.',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">10+</p>
              <p className="text-blue-100 mt-2">Active Projects</p>
            </div>
            <div>
              <p className="text-4xl font-bold">24</p>
              <p className="text-blue-100 mt-2">Team Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold">95%</p>
              <p className="text-blue-100 mt-2">On-Time Delivery</p>
            </div>
            <div>
              <p className="text-4xl font-bold">$500K+</p>
              <p className="text-blue-100 mt-2">Budget Managed</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Start managing your projects more efficiently today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Open Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/projects/create')}
            >
              Create First Project
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 ProjectAPW. All rights reserved.</p>
          <p className="text-sm mt-2">Version 2.0 - Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
}
