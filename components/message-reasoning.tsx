
"use client";

import { useState, useEffect } from 'react';
import { ChevronDownIcon, DeepThink2 } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import { useReasoningState } from '@/hooks/use-reasoning-state';
import ShimmerText from './shimmer';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({ isLoading, reasoning }: MessageReasoningProps) {
  const {
    isExpanded,
    isThinking,
    thinkingDuration,
    showReasoned,
    toggleExpanded
  } = useReasoningState(reasoning, isLoading);

  if (!reasoning && !isThinking) return null;

  const variants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0, marginBottom: 0 },
    expanded: { height: 'auto', opacity: 1, marginTop: '1rem', marginBottom: '0.5rem' },
  };

  return (
    <div className="flex flex-col rounded-lg p-2">
      <style jsx>{`
        /* keep the dots loader used elsewhere in this component */
        .dots-loader {
          display: inline-flex;
          gap: 2px;
          align-items: center;
        }

        .dots-loader span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(156, 163, 175, 0.8);
          animation: dots-bounce 1.4s ease-in-out infinite both;
        }

        .dots-loader span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .dots-loader span:nth-child(2) {
          animation-delay: -0.16s;
        }

        .dots-loader span:nth-child(3) {
          animation-delay: 0s;
        }

        @keyframes dots-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chevron {
          transition: transform 0.2s ease-in-out;
        }
        .chevron.expanded {
          transform: rotate(180deg);
        }
      `}</style>

      {isThinking ? (
        <div className="flex flex-row gap-2 w-fit rounded-xl p-1.5 items-center border">
          <DeepThink2 />
          <ShimmerText className="text-[clamp(1rem,4vw,1rem)]">Thinkink... {thinkingDuration} {thinkingDuration !== 1 ? 's' : ''}</ShimmerText>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={toggleExpanded}
          >
            <div className={`chevron ${isExpanded ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </div>
          </button>
        </div>
      ) : reasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm text-primary">
            Thought for {thinkingDuration} second{thinkingDuration !== 1 ? 's' : ''}
          </div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={toggleExpanded}
          >
            <div className={`chevron ${isExpanded ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </div>
          </button>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className=""
          >
            <Markdown className="space-y-4">{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
