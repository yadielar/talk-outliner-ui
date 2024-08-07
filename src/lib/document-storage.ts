import { OutlineDoc } from '../types';

export const documentStorage = {
  save: saveDocument,
  load: loadDocument,
};

const DOCUMENT_STORAGE_KEY = 'talk-outline';

function loadDocument(): OutlineDoc | undefined {
  const json = localStorage.getItem(DOCUMENT_STORAGE_KEY);
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

function saveDocument(document: OutlineDoc): void {
  const json = JSON.stringify(document);
  try {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, json);
    console.log(`Document "${document.name}" saved.`);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Error saving document "${document.name}":`, error);
      alert('Local Storage quota exceeded. Document may be too large to save.');
    } else {
      throw error;
    }
  }
}
