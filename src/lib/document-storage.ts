import { OutlineDoc, OutlineDocParsed } from '../types';
import { cleanOutlineDoc, isOutlineDocParsed } from './document-utils';

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

function saveDocument(doc: OutlineDoc | OutlineDocParsed): void {
  const cleanDoc = isOutlineDocParsed(doc) ? cleanOutlineDoc(doc) : doc;
  const json = JSON.stringify(cleanDoc);

  try {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, json);
    console.log(`Document "${doc.name}" saved.`);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Error saving document "${doc.name}":`, error);
      alert('Local Storage quota exceeded. Document may be too large to save.');
    } else {
      throw error;
    }
  }
}
