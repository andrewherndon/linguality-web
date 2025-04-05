// src/features-real/library/components/LibraryView.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useLibraryStore } from '../store/libraryStore';
import BookGrid from './BookGrid';
import UploadDialog from './UploadDialog';
import { BookFilters } from './BookFilters';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const navigate = useNavigate();
  const { books, isLoading, error, handleUpload } = useBooks();
  const setFilters = useLibraryStore(state => state.setFilters);
  const setSort = useLibraryStore(state => state.setSort);

  const handleBookSelect = (bookId: string) => {
    navigate('/reader', {
      state: { bookId, type: 'custom' }
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load library</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <UploadDialog onUpload={handleUpload} />
      </div>

      {/* Filters */}
      <BookFilters 
        onFilterChange={setFilters}
        onSortChange={setSort}
      />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="h-80 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            Your library is empty. Upload your first book to get started.
          </p>
          <UploadDialog>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Book
            </Button>
          </UploadDialog>
        </div>
      ) : (
        <BookGrid 
          books={books}
          onSelect={handleBookSelect}
        />
      )}
    </div>
  );
};