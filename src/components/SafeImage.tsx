import React, { useState, useEffect } from 'react';

// Global cache to avoid repeated proxy requests for the same image URL
const imageCache: Record<string, string> = {};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

export function SafeImage({ src, fallbackSrc, className, ...props }: SafeImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setResolvedSrc(fallbackSrc || '');
      return;
    }

    // If it's already cached, resolve instantly
    if (imageCache[src]) {
      setResolvedSrc(imageCache[src]);
      return;
    }

    // Check if it looks like a typical webpage viewer link instead of a direct image link.
    // Generally, direct image links end with extensions like .jpg, .png, .webp, .gif or start with data:image.
    // If it is from known hosting sites like ibb.co, imgur, postimg, etc., and does not end with direct extensions, we resolve it.
    const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)(?:\?.*)?$/i.test(src);
    const isDataUri = src.startsWith('data:');
    const isKnownViewer = src.includes('ibb.co/') || src.includes('postimg.cc/') || src.includes('imgur.com/');

    const needsResolution = isKnownViewer && !hasImageExtension && !isDataUri;

    if (needsResolution) {
      setIsLoading(true);
      // Clean up the target URL to ensure it has a protocol
      let targetUrl = src.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      // Use a robust and free CORS proxy (allorigins) to read the webpage HTML
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

      fetch(proxyUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Proxy network response was not ok');
          return res.json();
        })
        .then((data) => {
          const html = data.contents;
          if (!html) throw new Error('No contents returned from proxy');

          // Extract og:image, twitter:image, or image_src link
          const ogImageMatch = 
            html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
            html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
            html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
            html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);

          if (ogImageMatch && ogImageMatch[1]) {
            let resolved = ogImageMatch[1];
            // Decode HTML entities if present
            resolved = resolved.replace(/&amp;/g, '&');
            imageCache[src] = resolved;
            setResolvedSrc(resolved);
          } else {
            // Search specifically for any i.ibb.co URL inside the source for ibb.co links
            if (src.includes('ibb.co/')) {
              const ibbMatch = html.match(/https:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp|gif)/i);
              if (ibbMatch && ibbMatch[0]) {
                imageCache[src] = ibbMatch[0];
                setResolvedSrc(ibbMatch[0]);
                return;
              }
            }
            // Fallback to original
            imageCache[src] = src;
            setResolvedSrc(src);
          }
        })
        .catch(() => {
          // Fallback to original on error
          setResolvedSrc(src);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setResolvedSrc(src);
    }
  }, [src, fallbackSrc]);

  return (
    <img
      src={resolvedSrc || fallbackSrc}
      className={`${className || ''} ${isLoading ? 'animate-pulse opacity-60' : ''}`}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
