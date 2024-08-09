import { useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Quote } from './quote';

interface ContentEditorExtensionsOptions {
  placeholder: string;
}

export function useContentEditorExtensions({
  placeholder,
}: ContentEditorExtensionsOptions) {
  return useMemo(
    () => [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        gapcursor: false,
        hardBreak: false,
        heading: false,
        horizontalRule: false,
      }),
      Quote,
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  );
}

