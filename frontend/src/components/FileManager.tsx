import { useState, useEffect } from 'react';
import { 
  File, 
  Image, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Grid,
  List,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileUpload } from './FileUpload';
import { fileService, type UploadedFile } from '../services/fileService';

interface FileManagerProps {
  entityType?: 'project' | 'task' | 'general';
  entityId?: string;
  className?: string;
  onFileSelect?: (file: UploadedFile) => void;
  showUpload?: boolean;
}

const FileManager = ({ 
  entityType = 'general',
  entityId,
  className,
  onFileSelect,
  showUpload = true
}: FileManagerProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('date');

  // Load files
  useEffect(() => {
    const loadFiles = () => {
      const allFiles = entityId && entityType !== 'general' 
        ? fileService.getFilesByEntity(entityType, entityId)
        : fileService.getAllFiles();
      setFiles(allFiles);
    };

    loadFiles();
  }, [entityType, entityId]);

  // Filter and sort files
  useEffect(() => {
    let filtered = files;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(file => {
        if (selectedTab === 'images') return fileService.isImageFile(file.type);
        if (selectedTab === 'documents') return !fileService.isImageFile(file.type);
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredFiles(filtered);
  }, [files, selectedTab, searchQuery, sortBy]);

  const handleFileUploaded = async (uploadedFiles: File[]) => {
    try {
      await fileService.uploadFiles(
        uploadedFiles,
        entityType,
        entityId,
        'Current User'
      );
      
      // Reload files
      const allFiles = entityId && entityType !== 'general' 
        ? fileService.getFilesByEntity(entityType, entityId)
        : fileService.getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      fileService.deleteFile(fileId);
      
      // Remove from local state
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (file: UploadedFile) => {
    if (fileService.isImageFile(file.type)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeCount = (type: 'all' | 'images' | 'documents') => {
    if (type === 'all') return files.length;
    if (type === 'images') return files.filter(f => fileService.isImageFile(f.type)).length;
    if (type === 'documents') return files.filter(f => !fileService.isImageFile(f.type)).length;
    return 0;
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-6 w-6 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Files {entityType !== 'general' && entityId && `(${entityType} ${entityId})`}
          </h3>
          <Badge variant="outline">{filteredFiles.length} files</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: 'name' | 'size' | 'date') => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="size">Sort by Size</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="rounded-l-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Upload */}
      {showUpload && (
        <FileUpload
          onFilesSelected={async (files) => {
            await handleFileUploaded(files);
            // Return empty array as the actual files will be handled by the fileService
            return [];
          }}
          className="mb-6"
        />
      )}

      {/* File Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Files ({getFileTypeCount('all')})
          </TabsTrigger>
          <TabsTrigger value="images">
            Images ({getFileTypeCount('images')})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({getFileTypeCount('documents')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search criteria' : 'Upload some files to get started'}
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
            )}>
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    'border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
                    viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-3'
                  )}
                  onClick={() => onFileSelect?.(file)}
                >
                  <div className="flex-shrink-0">
                    {viewMode === 'list' ? (
                      getFileIcon(file)
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {fileService.formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploadDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {file.uploader}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open file preview
                        window.open(file.url, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download file
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileManager;