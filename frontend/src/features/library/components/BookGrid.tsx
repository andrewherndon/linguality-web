// src/features-real/library/components/BookGrid.tsx
import React from 'react';
import { format } from 'date-fns';
import { Book } from '../services/bookService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBooks } from '../hooks/useBooks';

interface BookGridProps {
  books: Book[];
  onSelect: (bookId: string) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onSelect }) => {
  const { deleteBook } = useBooks();
  const [editingBook, setEditingBook] = React.useState<Book | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card 
          key={book.id}
          className="flex flex-col hover:shadow-lg transition-shadow duration-300"
        >
          <CardContent className="p-4 flex-1">
            <div className="space-y-4">
              {/* Header with title and actions */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold line-clamp-2">{book.title}</h4>
                  {book.author && (
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBook(book)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteBook(book.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="uppercase">
                  {book.language}
                </Badge>
                <Badge variant="outline">
                  EPUB
                </Badge>
              </div>

              {/* Last read time */}
              {book.lastRead && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {format(book.lastRead, 'MMM d, yyyy')}
                </div>
              )}

              {/* Reading progress */}
              {typeof book.lastPosition === 'number' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(book.lastPosition * 100)}%</span>
                  </div>
                  <Progress value={book.lastPosition * 100} />
                </div>
              )}

              {/* Continue reading button */}
              <Button 
                className="w-full"
                onClick={() => onSelect(book.id)}
              >
                Continue Reading
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit dialog */}

    </div>
  );
};

export default BookGrid;