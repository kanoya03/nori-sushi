import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { src: string; alt: string; priority?: boolean };

export function ProductImage({ src, alt, priority = false }: Props) {
  const { t } = useTranslation();
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!src || failedSource === src) {
    return (
      <div
        className="image-fallback"
        role="img"
        aria-label={`${alt}: ${t('common.imageUnavailable')}`}
      >
        <ImageOff size={28} strokeWidth={1.3} aria-hidden="true" />
        <span>{t('common.imageUnavailable')}</span>
      </div>
    );
  }

  return (
    <img
      className="food-image"
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailedSource(src)}
    />
  );
}
