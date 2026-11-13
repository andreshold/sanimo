/**
 * Contrat D1 (application) ↔ D2 (IA).
 * Les écrans n'appellent que `Orchestrator`. D2 fournit l'implémentation réelle ;
 * D1 utilise une simulation tant qu'elle n'est pas prête.
 */

export type Lang = 'ht' | 'fr';

export type ModelId = 'oswald' | 'makandal' | 'fatiman';

export type ModelState =
  | 'absent'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'ready'
  | 'loaded'
  | 'error';

export interface ModelFile {
  /** Nom du fichier sur le téléphone */
  name: string;
  url: string;
  /** Taille exacte en octets, vérifiée après téléchargement */
  bytes: number;
  sha256?: string;
}

export interface ModelManifestEntry {
  id: ModelId;
  files: ModelFile[];
  /** Ordre de téléchargement : 1 = d'abord (voix), 2 = ensuite (Makandal) */
  order: number;
}

export interface DetectResult {
  /** Identifiants pris uniquement dans la liste fermée de content/symptomes */
  ids: string[];
  source: 'makandal' | 'lexique' | 'union';
  ms: number;
}

export interface Orchestrator {
  /** Oswald : fichier WAV (PCM 16 kHz mono) → texte créole */
  transcribe(wavUri: string): Promise<{ text: string; ms: number }>;
  /** Makandal + lexique (union) */
  detectSymptoms(text: string, lang: Lang): Promise<DetectResult>;
  /** Récapitulatif « Ou di m… se sa ? » ; null = repli sur la phrase à trous */
  recap(text: string, ids: string[], lang: Lang): Promise<string | null>;
  /** Fatiman : lit un texte variable */
  speak(text: string): Promise<void>;
  stopSpeaking(): void;
  /** Libère tous les modèles chargés (mémoire) */
  releaseAll(): Promise<void>;
}
