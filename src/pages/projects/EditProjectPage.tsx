import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectCreateForm } from '@/components/projects/ProjectCreateForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        toast.error('Project ID is missing');
        navigate('/projects/my-projects');
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/projects/${id}`);
        
        if (response.data?.success) {
          setProjectData(response.data.data);
        } else if (response.data?.data) {
          setProjectData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        navigate('/projects/my-projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const handleSubmit = async (data: any) => {
    if (!id) {
      toast.error('Project ID is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put(`/projects/${id}`, data);
      
      if (response.data?.success || response.status === 200) {
        toast.success('Project updated successfully!');
        navigate(`/projects/${id}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground">
              Update the project details below
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
              Edit the project details. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectData && (
              <ProjectCreateForm
                initialData={projectData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditProjectPage;
