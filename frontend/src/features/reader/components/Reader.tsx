// src/features-real/reader/components/Reader.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ReturnButton } from '@/components/shared/ReturnButton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useReader } from '../hooks/useReader';
import TranslationPopup from './TranslationPopup';
import { Switch } from '@/components/ui/switch';
import { Book, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';

const Reader: React.FC = () => {
  const location = useLocation();
  const { bookId, bookTitle, bookType = 'featured' } = location.state || {};
  const { user } = useAuth();
  
  // Initialize reader functionality from the useReader hook
  const { 
    content, 
    position, 
    loading, 
    error, 
    settings,
    updatePosition,
    updateSettings,
    saveProgress
  } = useReader({
    bookId,
    bookTitle,
    bookType,
  });

  // Local state for UI
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [wordContextData, setWordContextData] = useState({
    position: -1,
    context: '',
    saved: false
  });

  // Handle word click/selection
  const handleWordClick = async (word: string, index: number) => {
    if (isTranslating) return;
    
    setCurrentWord(word);
    setIsTranslating(true);
    setShowTranslation(true);
    
    try {
      // Get surrounding words for context
      const startIdx = Math.max(0, index - 5);
      const endIdx = Math.min(content?.words.length || 0, index + 6);
      const context = content?.words.slice(startIdx, endIdx).join(' ') || '';
      
      // Set word context data for saving
      setWordContextData({
        position: index,
        context,
        saved: false
      });
      
      // Get translation
      const result = await fetch(`http://localhost:5000/api/translate?word=${encodeURIComponent(word)}`);
      const data = await result.json();
      setTranslation(data.translate[1].translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle saving a word
  const handleSaveWord = async () => {
    if (!user || wordContextData.saved) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/save-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          word: currentWord,
          context: wordContextData.context,
          bookId,
          position: wordContextData.position
        }),
      });
      
      if (response.ok) {
        setWordContextData(prev => ({ ...prev, saved: true }));
      }
    } catch (error) {
      console.error('Error saving word:', error);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!content?.words.length) return;
    
    const newIndex = Math.min(position.wordIndex + 1, content.words.length - 1);
    updatePosition({ wordIndex: newIndex });
    setShowTranslation(false);
    setTranslation('');
    setCurrentWord('');
    setWordContextData({ position: -1, context: '', saved: false });
  };

  const handlePrevious = () => {
    if (!content?.words.length) return;
    
    const newIndex = Math.max(position.wordIndex - 1, 0);
    updatePosition({ wordIndex: newIndex });
    setShowTranslation(false);
    setTranslation('');
    setCurrentWord('');
    setWordContextData({ position: -1, context: '', saved: false });
  };

  // Save progress to the server when position changes
  useEffect(() => {
    if (user && bookId && content?.words.length && position.wordIndex > 0) {
      // Save progress every 10 words or when component unmounts
      const progressPercentage = position.wordIndex / content.words.length;
      const shouldSave = position.wordIndex % 10 === 0;
      
      if (shouldSave) {
        saveProgress(progressPercentage);
      }
    }
    
    return () => {
      // Save progress when component unmounts
      if (user && bookId && content?.words.length && position.wordIndex > 0) {
        const progressPercentage = position.wordIndex / content.words.length;
        saveProgress(progressPercentage);
      }
    };
  }, [user, bookId, content?.words.length, position.wordIndex, saveProgress]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!showTranslation) {
          handleWordClick(content?.words[position.wordIndex] || '', position.wordIndex);
        } else if (!wordContextData.saved) {
          handleSaveWord();
        } else {
          handleNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    content, 
    position.wordIndex, 
    showTranslation, 
    wordContextData.saved
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading book...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading book: {error.message}</p>
          <ReturnButton />
        </div>
      </div>
    );
  }

  // No content state
  if (!content || !content.words.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-medium mb-2">No content available</p>
          <p className="text-muted-foreground mb-6">The book content could not be loaded or is empty.</p>
          <ReturnButton />
        </div>
      </div>
    );
  }

  // Determine surrounding words for word mode
  const getSurroundingWords = () => {
    const wordsToShow = window.innerWidth < 768 ? 3 : 5;
    const half = Math.floor(wordsToShow / 2);
    const start = Math.max(0, position.wordIndex - half);
    const end = Math.min(content.words.length, start + wordsToShow);
    return content.words.slice(start, end);
  };

  return (
    <div className="h-screen flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ReturnButton />
          <h1 className="text-xl font-bold truncate">{bookTitle || 'Reader'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {content.words.length > 0 && (
            <Progress 
              value={(position.wordIndex / content.words.length) * 100} 
              className="w-40 md:w-60 lg:w-80"
            />
          )}
          
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Reading Settings</SheetTitle>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Reading Mode</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reading-mode" className="flex-1">
                      {settings.mode === 'word' ? 'Word by Word' : 'Line by Line'}
                    </Label>
                    <Switch
                      id="reading-mode"
                      checked={settings.mode === 'word'}
                      onCheckedChange={(checked) => {
                        updateSettings({ mode: checked ? 'word' : 'line' });
                        setShowTranslation(false);
                        setTranslation('');
                      }}
                    />
                  </div>
                </div>
                
                {settings.mode === 'word' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Word Orientation</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="word-orientation" className="flex-1">
                        {settings.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
                      </Label>
                      <Switch
                        id="word-orientation"
                        checked={settings.orientation === 'vertical'}
                        onCheckedChange={(checked) => {
                          updateSettings({ orientation: checked ? 'vertical' : 'horizontal' });
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Text Size</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({ fontSize: Math.max(settings.fontSize - 1, 12) })}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">{settings.fontSize}px</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({ fontSize: Math.min(settings.fontSize + 1, 28) })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Reading Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.mode === 'word'}
            onCheckedChange={(checked) => {
              updateSettings({ mode: checked ? 'word' : 'line' });
              setShowTranslation(false);
              setTranslation('');
            }}
            id="reading-mode"
          />
          <label htmlFor="reading-mode">
            {settings.mode === 'word' ? 'Word by Word' : 'Line by Line'}
          </label>
        </div>

        {settings.mode === 'word' && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.orientation === 'vertical'}
              onCheckedChange={(checked) => {
                updateSettings({ orientation: checked ? 'vertical' : 'horizontal' });
              }}
              id="word-orientation"
            />
            <label htmlFor="word-orientation">
              {settings.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
            </label>
          </div>
        )}
      </div>

      {/* Main Reading Area */}
      <div 
        className="flex-1 border rounded-lg p-4 flex items-center justify-center overflow-auto"
        style={{ fontSize: `${settings.fontSize}px` }}
      >
        {settings.mode === 'word' ? (
          // Word-by-word mode
          <div id="reading-box" className="flex flex-col h-full w-full justify-between">
            <div className="flex-1 flex items-center justify-center">
              <div className={`flex ${settings.orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center gap-4`}>
                {getSurroundingWords().map((word, index) => {
                  const isCurrentWord = word === content.words[position.wordIndex];
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-200 ${
                        isCurrentWord 
                          ? 'text-2xl font-bold text-primary'
                          : 'text-lg text-muted-foreground'
                      }`}
                    >
                      <span className="px-2 py-1 text-center">{word}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {showTranslation && (
              <div className="h-1/4 flex items-center justify-center mt-8">
                <div className="text-lg font-medium space-y-2">
                  <div>Translation: 
                    {isTranslating 
                      ? <span className="ml-2 text-muted-foreground animate-pulse">Loading...</span>
                      : <span className="ml-2">{translation}</span>
                    }
                  </div>
                  {!isTranslating && !wordContextData.saved && (
                    <Button 
                      onClick={handleSaveWord}
                      size="sm"
                      className="mt-2"
                    >
                      Save Word
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Line-by-line mode
          <div className="text-lg leading-relaxed overflow-y-auto h-full w-full">
            {content.words.map((word, index) => (
              <span
                key={index}
                className={`cursor-pointer hover:underline px-1 ${
                  index === position.wordIndex ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleWordClick(word, index)}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Translation popup for line mode */}
      {settings.mode === 'line' && showTranslation && (
        <TranslationPopup
          word={currentWord}
          translation={translation}
          isLoading={isTranslating}
          isSaved={wordContextData.saved}
          position={{ x: 0, y: 0 }}
          onSave={handleSaveWord}
          onClose={() => {
            setShowTranslation(false);
            setTranslation('');
            setCurrentWord('');
          }}
        />
      )}

      {/* Navigation buttons */}
      {settings.mode === 'word' && (
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handlePrevious}
            disabled={position.wordIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => {
              if (!showTranslation) {
                handleWordClick(content.words[position.wordIndex], position.wordIndex);
              } else if (!wordContextData.saved) {
                handleSaveWord();
              } else {
                handleNext();
              }
            }}
          >
            {!showTranslation ? 'Show Translation' : 
             !wordContextData.saved ? 'Save Word' : 'Next Word'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={position.wordIndex === content.words.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reader;