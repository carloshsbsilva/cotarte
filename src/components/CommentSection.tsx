import React, { useState } from 'react';
import { User, Send } from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  artworkId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, artworkId }) => {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // In a real application, you would send this to an API
    const comment: Comment = {
      id: `temp-${Date.now()}`,
      artworkId,
      userId: 'current-user',
      userName: 'Você',
      userAvatar: null,
      content: newComment,
      date: new Date().toISOString(),
      likes: 0
    };
    
    setLocalComments([comment, ...localComments]);
    setNewComment('');
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Comentários</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative">
              <textarea
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="absolute bottom-2 right-2">
                <button
                  type="submit"
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
                  disabled={!newComment.trim()}
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {localComments.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Seja o primeiro a comentar sobre esta obra!</p>
        ) : (
          localComments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                {comment.userAvatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={comment.userAvatar}
                    alt={comment.userName}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{comment.userName}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  <p>{comment.content}</p>
                </div>
                <div className="mt-2 text-xs">
                  <button className="text-gray-500 hover:text-gray-700">
                    Curtir ({comment.likes})
                  </button>
                  <span className="mx-2 text-gray-300">•</span>
                  <button className="text-gray-500 hover:text-gray-700">
                    Responder
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;