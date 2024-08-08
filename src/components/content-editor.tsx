import { memo, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Content } from '@/types';

const extensions = [StarterKit];

type ContentEditorProps = {
  initialValue: Content;
  onChange: (value: Content) => void;
};

export const ContentEditor = memo(function ContentEditor({
  initialValue,
  onChange,
}: ContentEditorProps) {
  const editor = useEditor({
    extensions,
    content: initialValue || '',
  });

  /**
   * Rather than using the `onUpdate` option of `useEditor`, we're using an
   * Effect to listen to the `editor`'s `update` event. This is because the
   * `onUpdate` callback becomes stale unless the dependency array of `useEditor`
   * is provided, but using the dependency array causes other issues, like the
   * editor being reinitialized on every render.
   *
   * This fix was suggested in the following issue:
   * https://github.com/ueberdosis/tiptap/issues/2403
   *
   * in this comment:
   * https://github.com/ueberdosis/tiptap/issues/2403#issuecomment-1283036506
   *
   * Others suggested using the `useEffectEvent` hook to keep the callback
   * passed to `onUpdate` fresh, which might work too.
   */
  useEffect(() => {
    editor?.on('update', ({ editor: updatedEditor }) => {
      const html = updatedEditor.getHTML();
      onChange(html);
    });
    return () => {
      editor?.off('update');
    };
  }, [editor, onChange]);

  return (
    <EditorContainer>
      <EditorContent editor={editor} />
    </EditorContainer>
  );
});

function EditorContainer(props: React.PropsWithChildren<{ id?: string }>) {
  return (
    <div
      className="border border-input bg-background rounded transition focus-within:border-ring"
      {...props}
    />
  );
}
