/**
 * Normalise a PocketBase relation field that may arrive as a string (single
 * relation) or as an array of strings (multiple relations), returning a
 * consistent string[].  Handles the case where PocketBase returns a bare
 * string instead of a one-element array for un-expanded relation fields.
 */
export const toTagIds = (v: unknown): string[] =>
  Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
