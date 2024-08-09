import { memo, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  TextQuote,
} from 'lucide-react';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { Content } from '@/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useContentEditorExtensions } from '@/lib/content-extensions';

type ContentEditorProps = {
  initialValue: Content;
  onChange: (value: Content) => void;
  placeholder: string;
};

export const ContentEditor = memo(function ContentEditor({
  initialValue,
  onChange,
  placeholder,
}: ContentEditorProps) {
  const extensions = useContentEditorExtensions({
    placeholder,
  });

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

  const toggleGroupValue = Object.entries({
    bold: editor?.isActive('bold'),
    italic: editor?.isActive('italic'),
    strike: editor?.isActive('strike'),
    bulletList: editor?.isActive('bulletList'),
    orderedList: editor?.isActive('orderedList'),
    blockquote: editor?.isActive('blockquote'),
    quote: editor?.isActive('quote'),
  })
    .filter(([, isActive]) => isActive)
    .map(([key]) => key);

  return (
    <EditorContainer>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-white border border-neutral-100 shadow-md rounded-lg p-1">
            <ToggleGroup size="sm" type="multiple" value={toggleGroupValue}>
              <ToggleGroupItem
                value="bold"
                aria-label="Toggle bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Toggle italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="strike"
                aria-label="Toggle strike"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="bulletList"
                aria-label="Toggle bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="orderedList"
                aria-label="Toggle ordered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="blockquote"
                aria-label="Toggle blockquote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <TextQuote className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="quote"
                aria-label="Toggle quote"
                onClick={() => editor.chain().focus().toggleQuote().run()}
              >
                <Quote className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </BubbleMenu>
      )}
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
