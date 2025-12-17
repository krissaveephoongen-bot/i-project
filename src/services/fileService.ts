import { toast } from 'react-hot-toast';

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadDate: string;
    entityType: 'project' | 'task' | 'general';
    entityId?: string;
    uploader: string;
}

class FileService {
    private readonly STORAGE_KEY = 'uploaded_files';

    // Get all files from storage
    getAllFiles(): UploadedFile[] {
        try {
            const files = localStorage.getItem(this.STORAGE_KEY);
            return files ? JSON.parse(files) : [];
        } catch (error) {
            console.error('Error reading files from storage:', error);
            return [];
        }
    }

    // Save files to storage
    private saveFiles(files: UploadedFile[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
        } catch (error) {
            console.error('Error saving files to storage:', error);
            toast.error('Failed to save file information');
        }
    }

    // Upload file (simulated with local storage)
    async uploadFile(
        file: File,
        entityType: 'project' | 'task' | 'general' = 'general',
        entityId?: string,
        uploader = 'Current User'
    ): Promise<UploadedFile> {
        // Create a unique ID for the file
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create file URL using local storage (in real app, this would be a server URL)
        const url = URL.createObjectURL(file);

        // Create file record
        const fileRecord: UploadedFile = {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            uploadDate: new Date().toISOString(),
            entityType,
            entityId,
            uploader,
        };

        // Get existing files and add new one
        const existingFiles = this.getAllFiles();
        existingFiles.push(fileRecord);
        this.saveFiles(existingFiles);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        toast.success(`File "${file.name}" uploaded successfully`);
        return fileRecord;
    }

    // Upload multiple files
    async uploadFiles(
        files: File[],
        entityType: 'project' | 'task' | 'general' = 'general',
        entityId?: string,
        uploader = 'Current User'
    ): Promise<UploadedFile[]> {
        const uploadPromises = files.map(file =>
            this.uploadFile(file, entityType, entityId, uploader)
        );

        try {
            const results = await Promise.allSettled(uploadPromises);
            const successful = results
                .filter((result): result is PromiseFulfilledResult<UploadedFile> =>
                    result.status === 'fulfilled'
                )
                .map(result => result.value);

            const failed = results.filter(result => result.status === 'rejected');

            if (failed.length > 0) {
                toast.error(`${failed.length} files failed to upload`);
            }

            if (successful.length > 0) {
                toast.success(`${successful.length} files uploaded successfully`);
            }

            return successful;
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files');
            return [];
        }
    }

    // Get files for specific entity
    getFilesByEntity(entityType: 'project' | 'task' | 'general', entityId?: string): UploadedFile[] {
        return this.getAllFiles().filter(file =>
            file.entityType === entityType && (!entityId || file.entityId === entityId)
        );
    }

    // Update file metadata
    updateFile(fileId: string, updates: Partial<Omit<UploadedFile, 'id' | 'url'>>): UploadedFile | null {
        try {
            const files = this.getAllFiles();
            const fileIndex = files.findIndex(f => f.id === fileId);

            if (fileIndex === -1) {
                toast.error('File not found');
                return null;
            }

            const updatedFile = {
                ...files[fileIndex],
                ...updates,
                id: fileId, // Ensure ID doesn't change
                url: files[fileIndex].url // Ensure URL doesn't change
            };

            files[fileIndex] = updatedFile;
            this.saveFiles(files);

            toast.success('File updated successfully');
            return updatedFile;
        } catch (error) {
            console.error('Error updating file:', error);
            toast.error('Failed to update file');
            return null;
        }
    }

    // Delete file
    deleteFile(fileId: string): void {
        try {
            const files = this.getAllFiles();
            const fileToDelete = files.find(f => f.id === fileId);

            if (!fileToDelete) {
                toast.error('File not found');
                return;
            }

            // Revoke the object URL to free memory
            URL.revokeObjectURL(fileToDelete.url);

            const updatedFiles = files.filter(f => f.id !== fileId);
            this.saveFiles(updatedFiles);

            toast.success(`File "${fileToDelete.name}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error('Failed to delete file');
        }
    }

    // Get file by ID
    getFileById(fileId: string): UploadedFile | null {
        const files = this.getAllFiles();
        return files.find(f => f.id === fileId) || null;
    }

    // Format file size
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get file extension
    getFileExtension(filename: string): string {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Check if file is image
    isImageFile(type: string): boolean {
        return type.startsWith('image/');
    }

    // Get file type icon
    getFileIcon(type: string): string {
        if (this.isImageFile(type)) return '🖼️';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
        if (type.includes('zip') || type.includes('compressed')) return '🗜️';
        return '📎';
    }

    // Fetch files from database
    async fetchFilesFromDatabase(): Promise<UploadedFile[]> {
        try {
            const response = await fetch('/api/files', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) {
                console.error('Failed to fetch files from database');
                return [];
            }
            const files = await response.json();
            return files;
        } catch (error) {
            console.error('Error fetching files from database:', error);
            return [];
        }
    }

    // Initialize files from database
    async initializeFilesFromDatabase(): Promise<void> {
        try {
            const files = await this.fetchFilesFromDatabase();
            if (files.length > 0) {
                this.saveFiles(files);
            }
        } catch (error) {
            console.error('Error initializing files from database:', error);
        }
    }
}

export const fileService = new FileService();