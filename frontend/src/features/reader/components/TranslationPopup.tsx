import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';

interface TranslationPopupProps {
  word: string;
  translation: string;
  isLoading: boolean;
  isSaved: boolean;
  position: { x: number; y: number };
  onSave: () => void;
  onClose: () => void;
}

export default function TranslationPopup({
  word,
  translation,
  isLoading,
  isSaved,
  position,
  onSave,
  onClose
}: TranslationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });

  // Position the popup relative to the clicked word
  useEffect(() => {
    if (!popupRef.current) return;
    
    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Calculate position
    let left = position.x - rect.width / 2;
    let top = position.y + 24; // Gap below the word
    
    // Keep popup within viewport
    if (left < 16) left = 16;
    if (left + rect.width > viewport.width - 16) {
      left = viewport.width - rect.width - 16;
    }
    
    // Position above if it would go off the bottom
    if (top + rect.height > viewport.height - 16) {
      top = position.y - rect.height - 16;
    }
    
    setPopupStyle({ top, left });
  }, [position]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 animate-in fade-in-50 zoom-in-95 duration-200"
      style={popupStyle}
    >
      <Card className="shadow-lg border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-medium mb-1 text-base">{word}</div>
              <div className="text-lg min-h-[28px]">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading translation...</span>
                  </div>
                ) : (
                  translation || 'No translation available'
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                variant={isSaved ? "outline" : "default"}
                onClick={onSave}
                disabled={isLoading || isSaved}
              >
                {isSaved ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  'Save Word'
                )}
              </Button>
              <Button 
                className="flex-1"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}