import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { FormTextarea } from './FormField';
import { Send, MessageCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { SkeletonText } from './ui/skeleton';

export interface CommentData {
  id: number;
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentsProps {
  taskId: number;
  comments: CommentData[];
  isLoading?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
  onEditComment?: (commentId: number, content: string) => Promise<void>;
  currentUserId?: number;
}

export function Comments({
  taskId,
  comments,
  isLoading = false,
  onAddComment,
  onDeleteComment,
  onEditComment,
  currentUserId,
}: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onEditComment?.(commentId, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setIsSubmitting(true);
    try {
      await onDeleteComment?.(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <FormTextarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="resize-none h-24"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewComment('')}
            disabled={!newComment.trim() || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <SkeletonText lines={2} />
              </div>
            ))}
          </>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              {editingId === comment.id ? (
                <div className="space-y-3">
                  <FormTextarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-20"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                      disabled={!editContent.trim() || isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {comment.userAvatar && (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="h-8 w-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {comment.userName}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {currentUserId === comment.userId && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
