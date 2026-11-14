import type { ht } from './ht';

/** Même arborescence de clés que ht.ts, avec des chaînes libres : fr.ts doit avoir exactement les mêmes clés. */
type DeepString<T> = { readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Translation = DeepString<typeof ht>;
