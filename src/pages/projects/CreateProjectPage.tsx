import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCreateForm } from '@/components/projects/ProjectCreateForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Import the API service for projects
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      // Call the API to create the project
      const response = await api.post('/projects', data);
      const newProject = response.data;
      
      // Show success message
      toast.success('Project created successfully!');
      
      // Redirect to the new project's detail page
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">
              Fill in the details below to create a new project
            </p>
          </div>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Enter the project details. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectCreateForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateProjectPage;
