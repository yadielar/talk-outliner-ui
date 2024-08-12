import { Voice as VoiceType } from '@/types';
import { Mark, mergeAttributes } from '@tiptap/react';

export interface VoiceOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    voice: {
      /**
       * Set a voice mark
       */
      setVoice: (attributes?: { voice: VoiceType }) => ReturnType;
      /**
       * Toggle a voice mark
       */
      toggleVoice: (attributes?: { voice: VoiceType }) => ReturnType;
      /**
       * Unset a voice mark
       */
      unsetVoice: () => ReturnType;
    };
  }
}

/**
 * This extension allows you to mark text with a voice style.
 */
export const Voice = Mark.create<VoiceOptions>({
  name: 'voice',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      voice: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-voice'),
        renderHTML: (attributes) => {
          if (!attributes.voice) {
            return {};
          }
          return {
            'data-voice': attributes.voice,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
        // getAttrs: (node) =>  node.getAttribute('data-voice') === this.name && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setVoice:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleVoice:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetVoice:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
