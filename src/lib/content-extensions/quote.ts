import { Mark, mergeAttributes } from '@tiptap/react';

export interface QuoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    quote: {
      /**
       * Set a quote mark
       */
      setQuote: () => ReturnType;
      /**
       * Toggle a quote mark
       */
      toggleQuote: () => ReturnType;
      /**
       * Unset a quote mark
       */
      unsetQuote: () => ReturnType;
    };
  }
}

/**
 * This extension allows you to mark text as a quote.
 */
export const Quote = Mark.create<QuoteOptions>({
  name: 'quote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'q',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'q',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setQuote:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleQuote:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetQuote:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
