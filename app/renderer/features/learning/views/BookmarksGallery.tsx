import React, { useState } from 'react';
import { BookmarkWithDetails } from '@shared/types/intelligence.types';
import { Button } from '../../../components/ui/Button';

interface Props {
  bookmarks: BookmarkWithDetails[];
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, content: string) => void;
}

export const BookmarksGallery: React.FC<Props> = ({ bookmarks, onToggleBookmark, onSaveNote }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');

  const handleEditNote = (bm: BookmarkWithDetails) => {
    setNoteContent(bm.note?.content || '');
    setEditingNoteId(bm.question.id);
  };

  const handleSaveNote = (questionId: string) => {
    onSaveNote(questionId, noteContent);
    setEditingNoteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Bookmarked Questions</h3>
        <div className="text-sm text-gray-500">
          {bookmarks.length} Bookmarks
        </div>
      </div>

      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            You haven't bookmarked any questions yet.
          </div>
        ) : (
          bookmarks.map((bm) => (
            <div key={bm.bookmark.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 flex flex-col"
                onClick={() => setExpandedId(expandedId === bm.question.id ? null : bm.question.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {bm.question.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">
                    Bookmarked: {new Date(bm.bookmark.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="text-gray-800 text-sm mb-2" dangerouslySetInnerHTML={{ __html: bm.question.questionText }} />
                
                {bm.question.questionImagePath && (
                  <img src={bm.question.questionImagePath} alt="Question" className="max-w-xs mt-2 rounded border border-gray-200" />
                )}
                
                {bm.note && editingNoteId !== bm.question.id && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900 flex items-start">
                    <span className="mr-2">📝</span>
                    <span className="whitespace-pre-wrap">{bm.note.content}</span>
                  </div>
                )}
              </div>

              {expandedId === bm.question.id && (
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Solution</h4>
                  <div className="text-gray-700 text-sm mb-4" dangerouslySetInnerHTML={{ __html: bm.question.solutionText || 'No solution text provided.' }} />
                  
                  {editingNoteId === bm.question.id ? (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Personal Note</label>
                      <textarea
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-app-primary focus:ring-app-primary sm:text-sm p-3 border"
                        rows={4}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add your personal notes, mnemonic devices, or reminders here..."
                      />
                      <div className="mt-3 flex justify-end space-x-3">
                        <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSaveNote(bm.question.id)}>Save Note</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                      <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onToggleBookmark(bm.question.id);
                      }}>
                        Remove Bookmark
                      </Button>
                      <Button variant="secondary" size="sm" onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditNote(bm);
                      }}>
                        {bm.note ? 'Edit Note' : 'Add Note'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
