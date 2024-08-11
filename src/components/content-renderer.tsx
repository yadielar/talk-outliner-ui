import { memo, useMemo } from 'react';
import { generateHTML } from '@tiptap/react';
import { Content } from '@/types';
import { cn } from '@/lib/utils';
import { useContentRendererExtensions } from '@/lib/content-extensions';

type ContentRendererProps = {
  value: Content;
  className?: string;
};

export const ContentRenderer = memo(function ContentRenderer({
  value,
  className,
}: ContentRendererProps) {
  const extensions = useContentRendererExtensions();

  const parsed = useMemo(() => {
    try {
      let html: string;

      if (typeof value === 'string') {
        html = value;
      } else {
        html = generateHTML(value, extensions);
      }

      return {
        html,
        error: null,
      };
    } catch (e: any) {
      return {
        html: null,
        error: e.message as string,
      };
    }
  }, [value, extensions]);

  if (parsed.error !== null) {
    return (
      <div className={cn('text-destructive', className)}>
        There was an error parsing the content.
      </div>
    );
  } else {
    return (
      <div
        className={cn('Content', className)}
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
    );
  }
});
