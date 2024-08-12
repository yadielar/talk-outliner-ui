import { useMemo } from 'react';
import StarterKit, { StarterKitOptions } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Quote } from './quote';
import { Voice } from './voice';

const starterKitConfig: Partial<StarterKitOptions> = {
  code: false,
  codeBlock: false,
  gapcursor: false,
  hardBreak: false,
  heading: false,
  horizontalRule: false,
};

interface ContentEditorExtensionsOptions {
  placeholder: string;
}

export function useContentEditorExtensions({
  placeholder,
}: ContentEditorExtensionsOptions) {
  return useMemo(
    () => [
      StarterKit.configure(starterKitConfig),
      Quote,
      Voice,
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  );
}

export function useContentRendererExtensions() {
  return useMemo(
    () => [StarterKit.configure(starterKitConfig), Quote, Voice],
    [],
  );
}
