// src/features-real/library/components/UploadDialog.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadDialogProps {
  onUpload: (file: File) => Promise<string>;
  children?: React.ReactNode;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ 
  onUpload,
  children 
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedBookId, setUploadedBookId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    language: 'auto'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMetadata(prev => ({
        ...prev,
        title: selectedFile.name.replace(/\.[^/.]+$/, '')
      }));
      // Reset upload states
      setUploadProgress(0);
      setUploadedBookId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const bookId = await onUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedBookId(bookId);
    } catch (error) {
      console.error('Error uploading book:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartReading = () => {
    if (uploadedBookId) {
      navigate('/reader', { 
        state: { 
          bookId: uploadedBookId,
          type: 'custom'
        } 
      });
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form state
    setFile(null);
    setMetadata({ title: '', author: '', language: 'auto' });
    setUploadProgress(0);
    setUploadedBookId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file">Book File</Label>
            <Input
              id="file"
              type="file"
              accept=".txt,.epub"
              onChange={handleFileChange}
              disabled={isUploading}
              required
            />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ 
                ...prev, 
                title: e.target.value 
              }))}
              disabled={isUploading}
              required
            />
          </div>
          
          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Author (Optional)</Label>
            <Input
              id="author"
              value={metadata.author}
              onChange={(e) => setMetadata(prev => ({ 
                ...prev, 
                author: e.target.value 
              }))}
              disabled={isUploading}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={metadata.language}
              onValueChange={(value) => setMetadata(prev => ({
                ...prev,
                language: value
              }))}
              disabled={isUploading}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 100 
                  ? `Uploading... ${uploadProgress}%`
                  : 'Upload complete!'}
              </p>
            </div>
          )}

          {/* Success Message & Start Reading Button */}
          {uploadedBookId && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Successfully uploaded!</span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={handleStartReading}
              >
                Start reading
              </Button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file || uploadedBookId !== null}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;