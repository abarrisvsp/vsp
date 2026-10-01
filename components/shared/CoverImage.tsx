import Image from 'next/image';

/**
 * A cover photo shown at its own aspect ratio, so portrait shots and scanned
 * magazine pages are not centre-cropped. Anything taller than the cap is
 * letterboxed on the dark background instead of being cut off.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  maxHeightClass,
  priority,
  className = '',
}: {
  src: string;
  alt: string;
  sizes: string;
  maxHeightClass: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // width/height 0 plus h-auto lets the browser use the file's real ratio,
    // since we don't store image dimensions.
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes={sizes}
      priority={priority}
      className={`block w-full h-auto object-contain bg-bg-elev ${maxHeightClass} ${className}`}
    />
  );
}
