'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useEditMode } from './EditModeProvider';
import { ImageUploadModal } from './ImageUploadModal';
import { updateSiteContent } from '@/lib/actions/content';
import { toast } from 'sonner';

interface InlineImageProps {
  contentKey: string;
  defaultUrl: string;
  storageFolder: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  revalidate?: string;
}

export function InlineImage({
  contentKey,
  defaultUrl,
  storageFolder,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  revalidate,
}: InlineImageProps) {
  const { isAdmin, editMode } = useEditMode();
  const [url, setUrl] = useState(defaultUrl);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleUploaded(publicUrl: string) {
    try {
      await updateSiteContent(contentKey, publicUrl, revalidate);
      setUrl(publicUrl);
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    }
  }

  const img = url ? (
    fill ? (
      <Image src={url} alt={alt} fill className={className} sizes={sizes} priority={priority} />
    ) : (
      <Image
        src={url}
        alt={alt}
        width={width || 1200}
        height={height || 800}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    )
  ) : (
    <div className={`${className} bg-bg-elev flex items-center justify-center text-ink-mute text-sm`}>
      No image set
    </div>
  );

  if (!isAdmin || !editMode) return img;

  return (
    <div className="relative group w-full h-full">
      {img}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
      >
        <Camera className="w-8 h-8 mb-2" />
        <span className="text-sm">Click to replace</span>
      </button>
      <ImageUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={handleUploaded}
        folder={storageFolder}
      />
    </div>
  );
}
