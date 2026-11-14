/**
 * « Efase done mwen yo » (E80) : efface tout ce que Sanimo garde sur le téléphone.
 * Les modèles d'IA (~1,7 Go) ne sont effacés que sur demande explicite : les retélécharger coûte cher.
 */
import { Directory, Paths } from 'expo-file-system';

import { getDb } from './app-db';
import { deleteAllAssessments } from './assessments';
import { resetSettings } from './settings';

/** Dossiers de l'application sous Paths.document */
export const PHOTOS_DIR = 'photos';
export const MODELS_DIR = 'models';

export interface EraseReport {
  assessments: number;
  photos: boolean;
  models: boolean;
}

function removeDir(name: string): boolean {
  const dir = new Directory(Paths.document, name);
  if (!dir.exists) return false;
  dir.delete();
  return true;
}

export function eraseAllData({ includeModels = false } = {}): EraseReport {
  const db = getDb();
  let assessments = 0;
  db.transaction(() => {
    assessments = deleteAllAssessments(db);
    if (includeModels) db.run('DELETE FROM models');
  });
  const photos = removeDir(PHOTOS_DIR);
  const models = includeModels ? removeDir(MODELS_DIR) : false;
  // En dernier : remet l'application à la première ouverture (E01)
  resetSettings();
  return { assessments, photos, models };
}
