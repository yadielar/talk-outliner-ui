import { memo } from 'react';
import {
  EditorContent,
  useEditor,
  FloatingMenu,
  BubbleMenu,
} from '@tiptap/react';
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
      const json = data.editor.getJSON();
      onChange(json);
    },
  });

  return (
    <EditorContainer>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
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
