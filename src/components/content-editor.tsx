import { memo, useEffect } from 'react';
import {
  Bold,
  Circle,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  TextQuote,
} from 'lucide-react';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { Content } from '@/types';
import { Voice } from '@/enums';
import { voices } from '@/constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
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
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'Content',
      },
    },
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

  const formatGroupValue = Object.entries({
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

  const voiceGroupValue =
    voices.find((voice) => editor?.isActive('voice', { voice })) ?? Voice.None;

  function toggleVoice(voice: Voice) {
    editor?.chain().focus().toggleVoice({ voice }).run();
  }

  return (
    <EditorContainer>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, maxWidth: '1000px' }}
        >
          <ScrollArea
            className="max-w-80 md:max-w-none bg-background border shadow-md rounded-lg pt-px"
            type="scroll"
          >
            <div className="flex items-center w-max space-x-4 p-1">
              <ToggleGroup size="sm" type="multiple" value={formatGroupValue}>
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
                  value="quote"
                  aria-label="Toggle quote"
                  onClick={() => editor.chain().focus().toggleQuote().run()}
                >
                  <Quote className="h-4 w-4" />
                </ToggleGroupItem>

                <Separator orientation="vertical" className="h-5 mx-3" />

                <ToggleGroupItem
                  value="bulletList"
                  aria-label="Toggle bullet list"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="orderedList"
                  aria-label="Toggle ordered list"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  <ListOrdered className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="blockquote"
                  aria-label="Toggle blockquote"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                >
                  <TextQuote className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              <Separator orientation="vertical" className="h-5" />

              <ToggleGroup type="single" value={voiceGroupValue}>
                <ToggleGroupItem
                  value={Voice.Info}
                  aria-label="Toggle info voice"
                  onClick={() => toggleVoice(Voice.Info)}
                >
                  <Circle
                    className="h-4 w-4 fill-info-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Question}
                  aria-label="Toggle question voice"
                  onClick={() => toggleVoice(Voice.Question)}
                >
                  <Circle
                    className="h-4 w-4 fill-question-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Reference}
                  aria-label="Toggle reference voice"
                  onClick={() => toggleVoice(Voice.Reference)}
                >
                  <Circle className="h-4 w-4 fill-quote" strokeWidth={0} />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Example}
                  aria-label="Toggle example voice"
                  onClick={() => toggleVoice(Voice.Example)}
                >
                  <Circle
                    className="h-4 w-4 fill-example-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Story}
                  aria-label="Toggle story voice"
                  onClick={() => toggleVoice(Voice.Story)}
                >
                  <Circle
                    className="h-4 w-4 fill-story-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Lesson}
                  aria-label="Toggle lesson voice"
                  onClick={() => toggleVoice(Voice.Lesson)}
                >
                  <Circle
                    className="h-4 w-4 fill-lesson-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Voice.Action}
                  aria-label="Toggle action voice"
                  onClick={() => toggleVoice(Voice.Action)}
                >
                  <Circle
                    className="h-4 w-4 fill-action-foreground"
                    strokeWidth={0}
                  />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
