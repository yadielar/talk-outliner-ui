import { memo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Content } from '@/types';

const extensions = [StarterKit];

type ContentEditorProps = {
  initialValue?: Content;
  onChange: (value: Content) => void;
};

export const ContentEditor = memo(function ContentEditor({
  initialValue,
  onChange,
}: ContentEditorProps) {
  const editor = useEditor({
    extensions,
    content: initialValue ?? '<p>Hello there!</p>',
    onUpdate(data) {
      const html = data.editor.getHTML();
      onChange(html);
    },
  });

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
