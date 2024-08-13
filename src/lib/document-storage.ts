import { ZodError } from 'zod';
import { fileOpen, fileSave } from 'browser-fs-access';
import { OutlineDoc, OutlineDocParsed } from '@/types';
import { OutlineDocSchema } from '@/schemas';
import { cleanOutlineDoc, isOutlineDocParsed } from './document-utils';

export const documentStorage = {
  loadFromLocalStorage,
  saveToLocalStorage,
  loadFromFile,
  saveToFile,
};

const DOCUMENT_LOCAL_STORAGE_KEY = 'talk-outline';

function loadFromLocalStorage(): OutlineDoc | undefined {
  const json = localStorage.getItem(DOCUMENT_LOCAL_STORAGE_KEY);
  if (json === null) {
    return undefined;
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error(`Error parsing document`, error);
    return undefined;
  }
}

function saveToLocalStorage(doc: OutlineDoc | OutlineDocParsed): void {
  const cleanDoc = isOutlineDocParsed(doc) ? cleanOutlineDoc(doc) : doc;
  const json = JSON.stringify(cleanDoc);

  try {
    localStorage.setItem(DOCUMENT_LOCAL_STORAGE_KEY, json);
    console.log('Document saved to local storage.');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('Error saving document:', error);
      alert('Local Storage quota exceeded. Document may be too large to save.');
    } else {
      console.error('Error saving document:', error);
    }
  }
}

type LoadFileResult =
  | {
      outlineDoc: OutlineDoc;
      fileHandle: FileSystemFileHandle | undefined;
      error: null;
    }
  | {
      outlineDoc: null;
      fileHandle: undefined;
      error: LoadFileErrorType;
    };

type LoadFileErrorType = 'invalid-json' | 'abort' | 'error';

async function loadFromFile(): Promise<LoadFileResult> {
  try {
    const file = await fileOpen({
      description: 'Outline JSON files',
      extensions: ['.json'],
      mimeTypes: ['application/json'],
    });

    const text = await file.text();
    const parsedJson = JSON.parse(text);
    console.log('Loaded file', file.handle);

    const doc = OutlineDocSchema.parse(parsedJson);

    return { outlineDoc: doc, fileHandle: file.handle, error: null };
  } catch (error) {
    let errorType: LoadFileErrorType;

    if (error instanceof ZodError) {
      console.error('Invalid JSON:', { issues: error.issues });
      errorType = 'invalid-json';
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('File load aborted');
      errorType = 'abort';
    } else {
      console.error('Failed to open file:', error);
      errorType = 'error';
    }

    return { outlineDoc: null, fileHandle: undefined, error: errorType };
  }
}

type SaveFileResult =
  | {
      success: true;
      fileHandle: FileSystemFileHandle | null;
      error: null;
    }
  | {
      success: false;
      fileHandle: null;
      error: any;
    };

async function saveToFile(
  doc: OutlineDoc | OutlineDocParsed,
  fileHandle?: FileSystemFileHandle,
): Promise<SaveFileResult> {
  try {
    const cleanDoc = isOutlineDocParsed(doc) ? cleanOutlineDoc(doc) : doc;
    const blob = new Blob([JSON.stringify(cleanDoc, null, 2)], {
      type: 'application/json',
    });

    const result = await fileSave(
      blob,
      {
        fileName: `${cleanDoc.head.title || 'outline'}.json`,
        extensions: ['.json'],
      },
      fileHandle,
    );
    console.log('Saved file', result);
    return { success: true, fileHandle: result, error: null };
  } catch (error) {
    console.error('Failed to save file:', error);
    return { success: false, fileHandle: null, error };
  }
}
