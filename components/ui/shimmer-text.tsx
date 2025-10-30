

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
  children,
  className
}) => {
  return (
    <>
      <style jsx>{`
        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(156, 163, 175, 0.6) 0%,
            rgba(156, 163, 175, 0.6) 40%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(156, 163, 175, 0.6) 60%,
            rgba(156, 163, 175, 0.6) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-sweep 2s linear infinite;
          font-weight: 500;
          will-change: background-position;
        }

        @keyframes shimmer-sweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Fallback for browsers that don't support background-clip: text */
        @supports not (-webkit-background-clip: text) {
          .shimmer-text {
            color: rgba(156, 163, 175, 0.8);
            animation: shimmer-fallback 2s ease-in-out infinite;
            -webkit-text-fill-color: initial;
          }

          @keyframes shimmer-fallback {
            0%, 100% {
              opacity: 0.6;
              text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
            }
            50% {
              opacity: 1;
              text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
            }
          }
        }
      `}</style>
      <span className={cn('shimmer-text', className)}>
        {children}
      </span>
    </>
  );
};
