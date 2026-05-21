import React, { useState, useEffect } from 'react';

interface TransparentImageProps {
  src: string;
  alt?: string;
  className?: string;
  tolerance?: number;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

// In-memory cache to hold base64 URLs of processed images so they are loaded instant-fast!
const processedCache: Record<string, string> = {};

export function TransparentImage({ src, tolerance = 20, className, ...props }: TransparentImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    // Retrieve from memory cache if available
    if (processedCache[src]) {
      setProcessedSrc(processedCache[src]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedSrc(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Uint8Array for fast visited pixel tracking
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Check if color is close to white within the tolerance range
        const isWhite = (r: number, g: number, b: number) => {
          return r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance;
        };

        const addPixel = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return;
          const idx = y * width + x;
          if (visited[idx]) return;

          const dataIdx = idx * 4;
          const r = data[dataIdx];
          const g = data[dataIdx + 1];
          const b = data[dataIdx + 2];
          const a = data[dataIdx + 3];

          // If the pixel is fully visible and meets the white threshold, add to flood fill queue
          if (a > 50 && isWhite(r, g, b)) {
            visited[idx] = 1;
            queue.push(idx);
          }
        };

        // Seed flood fill with all edge pixels of the image
        for (let x = 0; x < width; x++) {
          addPixel(x, 0);
          addPixel(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          addPixel(0, y);
          addPixel(width - 1, y);
        }

        // Perform Breadth-First-Search (BFS) flood fill to make the background transparent
        let head = 0;
        while (head < queue.length) {
          const currIdx = queue[head++];
          const cy = Math.floor(currIdx / width);
          const cx = currIdx % width;

          // Set alpha channel of background pixel to 0 (make fully transparent)
          data[currIdx * 4 + 3] = 0;

          // Check all 4-way adjacent neighbors
          addPixel(cx + 1, cy);
          addPixel(cx - 1, cy);
          addPixel(cx, cy + 1);
          addPixel(cx, cy - 1);
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        processedCache[src] = dataUrl;
        setProcessedSrc(dataUrl);
      } catch (err) {
        console.error('Failed to isolate mascot image from background:', err);
        setProcessedSrc(src); // Fallback to original
      }
    };

    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src, tolerance]);

  return (
    <img
      src={processedSrc || src}
      className={className}
      {...props}
    />
  );
}
