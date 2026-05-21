// src/components/TransparentImage.tsx
import React, { useState, useEffect } from 'react';

interface TransparentImageProps {
  src: string;
  alt?: string;
  className?: string;
  tolerance?: number;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

// Cache em memória para guardar as imagens já processadas em base64 e carregá-las instantaneamente
const processedCache: Record<string, string> = {};

export function TransparentImage({ src, tolerance = 20, className, ...props }: TransparentImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    // Recupera do cache se já processou essa URL antes
    if (processedCache[src]) {
      setProcessedSrc(processedCache[src]);
      return;
    }

    const img = new Image();
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

        // Controle para marcar pixels visitados
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Verifica se a cor do pixel está próxima ao branco puro dentro da tolerância
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

          // Se for visível e for branco, adiciona na fila de remoção
          if (a > 50 && isWhite(r, g, b)) {
            visited[idx] = 1;
            queue.push(idx);
          }
        };

        // Começa a remoção de fundo por todas as bordas da imagem externa
        for (let x = 0; x < width; x++) {
          addPixel(x, 0);
          addPixel(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          addPixel(0, y);
          addPixel(width - 1, y);
        }

        // Executa Breadth-First-Search (BFS) para inundar e remover apenas o fundo branco externo
        let head = 0;
        while (head < queue.length) {
          const currIdx = queue[head++];
          const cy = Math.floor(currIdx / width);
          const cx = currIdx % width;

          // Define o canal alpha (transparência) para zero
          data[currIdx * 4 + 3] = 0;

          // Verifica vizinhos 4-direcionais
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
        console.error('Falha ao processar transparência do mascote:', err);
        setProcessedSrc(src); // Fallback para a original em caso de erro
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