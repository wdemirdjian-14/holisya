import path from 'path';

// Les vidéos sont stockées HORS de /public : jamais accessibles en direct,
// uniquement via l'API de streaming authentifiée.
export const VIDEO_DIR = process.env.VIDEO_DIR || path.join(process.cwd(), 'private-media', 'videos');
export const VIDEO_THUMB_DIR = path.join(process.cwd(), 'public', 'uploads', 'video-thumbs');
