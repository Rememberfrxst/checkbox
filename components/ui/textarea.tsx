import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'input-form flex min-h-[46] max-h-[calc(34dvh)] overflow-y-auto bg-muted ring-offset-background font-normal placeholder:text-muted-foreground text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 pt-4 mb-1.5 scrollbar-thin scrollbar-thumb-bubblescrollbar scrollbar-track-transparent',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
