import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storeImage, getStoredImage, removeStoredImage, generateImageKey, checkStorageQuota, clearAllStoredImages, getImageQualityInfo } from '@/lib/imageStorage';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUpload = ({
  value,
  onChange,
  onFileChange,
  className,
  disabled = false,
  accept = 'image/*',
  maxSize = 5, // 5MB default
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must not exceed ${maxSize}MB`);
        return;
      }

      // Check storage quota
      const { available } = checkStorageQuota();
      if (available < 1024 * 1024) { // Less than 1MB available
        setError('Storage quota exceeded. Please clear some data or use a smaller image.');
        return;
      }

      try {
        // Generate unique key for this image
        const imageKey = generateImageKey();
        
        // Store compressed image
        const compressedDataUrl = await storeImage(file, imageKey);
        
        setPreview(compressedDataUrl);
        onChange(compressedDataUrl);
        onFileChange?.(file);
      } catch (error) {
        console.error('Failed to process image:', error);
        setError('Failed to process image. Please try a smaller image.');
      }
    },
    [maxSize, onChange, onFileChange]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    // If it's a stored image, remove it from storage
    if (preview && preview.startsWith('data:image')) {
      // Try to find and remove the stored image
      const imageKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('img_'))
        .find(key => localStorage.getItem(key) === preview);
      
      if (imageKeys) {
        removeStoredImage(imageKeys);
      }
    }
    
    setPreview(null);
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Product Image</Label>
      
      {preview ? (
        <Card className="relative group">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag and drop image here or{' '}
                <span className="text-primary">click to select</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Alternative URL input */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Or enter image URL</Label>
        <div className="flex space-x-2">
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value || null);
            }}
            disabled={disabled}
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Image quality info */}
        {value && value.startsWith('data:image') && (
          <div className="text-xs text-muted-foreground">
            {(() => {
              const info = getImageQualityInfo(value);
              return `Size: ${(info.size / 1024).toFixed(1)}KB, Quality: ${info.quality}`;
            })()}
          </div>
        )}
        
        {/* Clear all images button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            clearAllStoredImages();
            setPreview(null);
            onChange('');
            setError(null);
          }}
          disabled={disabled}
          className="w-full"
        >
          Clear All Stored Images
        </Button>
      </div>
    </div>
  );
};
