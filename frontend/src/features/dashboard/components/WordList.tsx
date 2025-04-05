import React, { useState } from 'react';
import WordDetails from './WordDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Edit2, 
  MoreVertical, 
  ArrowUp, 
  ArrowDown,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { Word } from '../types/word';
import { FilterOptions } from '../hooks/useUserWords';

interface WordListProps {
  words: Word[];
  filterOptions: FilterOptions;
  onFilterChange: (filter: Partial<FilterOptions>) => void;
}

const WordList: React.FC<WordListProps> = ({ 
  words, 
  filterOptions,
  onFilterChange
}) => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const getExpertiseLevelColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSelectRow = (wordId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === words.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(words.map(word => word.id)));
    }
  };

  const handleViewDetails = (word: Word) => {
    setSelectedWord(word);
  };

  const handleSort = (field: keyof Word) => {
    onFilterChange({
      sortBy: field,
      sortDirection: 
        filterOptions.sortBy === field && filterOptions.sortDirection === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };

  const getSortIcon = (field: keyof Word) => {
    if (filterOptions.sortBy !== field) return null;
    
    return filterOptions.sortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Your Vocabulary ({words.length} words)</CardTitle>
            
            <div className="flex gap-4">
              <div className="relative flex items-center">
                <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search words..."
                  value={filterOptions.searchTerm}
                  onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                  className="pl-8 w-[250px]"
                />
              </div>

              <Select
                value={filterOptions.expertiseLevel}
                onValueChange={(value) => onFilterChange({ expertiseLevel: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="new">New (0-30%)</SelectItem>
                  <SelectItem value="learning">Learning (30-60%)</SelectItem>
                  <SelectItem value="familiar">Familiar (60-90%)</SelectItem>
                  <SelectItem value="mastered">Mastered (90-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No words found. Start reading and save words to build your vocabulary!</p>
              <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                Return to Reading
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.size === words.length && words.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('original')}
                    >
                      <div className="flex items-center">
                        Word {getSortIcon('original')}
                      </div>
                    </TableHead>
                    <TableHead>Translation</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('lastSeen')}
                    >
                      <div className="flex items-center">
                        Last Seen {getSortIcon('lastSeen')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('expertiseLevel')}
                    >
                      <div className="flex items-center">
                        Expertise {getSortIcon('expertiseLevel')}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word) => (
                    <TableRow 
                      key={word.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(word)}
                    >
                      <TableCell className="p-0 pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(word.id)}
                          onCheckedChange={() => handleSelectRow(word.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{word.original}</TableCell>
                      <TableCell>{word.translation}</TableCell>
                      <TableCell>
                        {word.lastSeen ? format(new Date(word.lastSeen), 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={word.expertiseLevel} 
                            className="w-24"
                          />
                          <span>{Math.round(word.expertiseLevel)}%</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(word)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Word
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRows.size > 0 && (
        <div className="bg-muted p-2 rounded-md flex justify-between items-center">
          <span>{selectedRows.size} words selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Add to List</Button>
            <Button size="sm" variant="outline">Practice Selected</Button>
            <Button size="sm" variant="destructive">Delete</Button>
          </div>
        </div>
      )}

      {selectedWord && (
        <WordDetails
          word={selectedWord}
          open={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};

export default WordList;