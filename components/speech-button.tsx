import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { SpeechIcon } from './icons';

export default function SpeechButton({ onStart, onStop }: { onStart?: () => void; onStop?: () => void }) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActive) {
      setIsActive(false);
      onStop?.();
    } else {
      setIsActive(true);
      onStart?.();
    }
  }, [isActive, onStart, onStop]);

  return (
    <Button
      data-testid="composer-speech-button"
      aria-label={isActive ? 'Stop voice mode' : 'Start voice mode'}
      className="relative flex h-9 w-9 items-center justify-center rounded-full"
      style={{ backgroundColor: '#ececec', color: '#424242' }}
      onClick={handleClick}
      variant="ghost"
    >
      <div className="flex items-center justify-center">
        <SpeechIcon/>
      </div>
    </Button>
  );
}
