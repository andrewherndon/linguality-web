// src/features-real/library/components/BookFilters.tsx
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FiltersProps {
  onFilterChange: (filters: {
    search?: string;
    language?: string | null;
    format?: 'txt' | 'epub' | null;
  }) => void;
  onSortChange: (sort: {
    field: 'title' | 'uploadDate' | 'lastRead';
    direction: 'asc' | 'desc';
  }) => void;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }
];

export const BookFilters: React.FC<FiltersProps> = ({ 
  onFilterChange,
  onSortChange
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search */}
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search books..."
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Language Filter */}
      <Select
        onValueChange={(value) => 
          onFilterChange({ language: value === 'all' ? null : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Languages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {LANGUAGES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Format Filter */}
      <Select
        onValueChange={(value: 'all' | 'txt' | 'epub') => 
          onFilterChange({ format: value === 'all' ? null : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Formats" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Formats</SelectItem>
          <SelectItem value="txt">Text</SelectItem>
          <SelectItem value="epub">EPUB</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <div className="flex gap-2">
        <Select
          onValueChange={(value: 'title' | 'uploadDate' | 'lastRead') => 
            onSortChange({ field: value, direction: 'desc' })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="uploadDate">Upload Date</SelectItem>
            <SelectItem value="lastRead">Last Read</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value: 'asc' | 'desc') => 
            onSortChange((prev) => ({ ...prev, direction: value }))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};