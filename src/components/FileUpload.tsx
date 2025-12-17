import React, { useState, useRef } from 'react';
import { Upload, X, FileIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => Promise<UploadedFile[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  accept = '*',
  multiple = true,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFiles = (fileList: FileList) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    Array.from(fileList).forEach((file) => {
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${formatFileSize(maxSize)} limit`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleFileSelect = async (fileList: FileList) => {
    const { validFiles, errors } = validateFiles(fileList);

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // Create upload entries
    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading' as const,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      const uploadedFiles = await onFilesSelected(validFiles);
      setFiles((prev) =>
        prev.map((file) => {
          const uploaded = uploadedFiles.find((f) => f.name === file.name);
          return uploaded ? { ...file, ...uploaded, status: 'success' as const } : file;
        })
      );
    } catch (error) {
      console.error('Upload failed:', error);
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: 'error' as const,
          error: 'Upload failed',
        }))
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
            Drag files here or click to select
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="text-xl">{getFileIcon(file.type)}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {file.status === 'uploading' && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {file.progress || 0}%
                    </span>
                  </div>
                )}

                {file.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}

                {file.status === 'error' && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {file.error}
                    </span>
                  </div>
                )}

                {file.status === 'success' || file.status === 'error' ? (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
