import mime from "mime-types";
import { extname } from "path-cross";

function getMime(path: string): string | null {
  return mime.lookup(path) || null;
}

export function isAudio(path: string): boolean {
  return getMime(path)?.startsWith("audio/") || false;
}
export function isSvg(path: string): boolean {
  return getMime(path) === "image/svg+xml";
}

export function isFont(path: string): boolean {
  return getMime(path)?.startsWith("font/") || false;
}

export function isImage(path: string): boolean {
  return getMime(path)?.startsWith("image/") || false;
}

export function isVideo(path: string): boolean {
  return (
    getMime(path)?.startsWith("video/") === true && extname(path) !== ".ts"
  );
}

export function isMarkdown(path: string): boolean {
  return getMime(path) === "text/markdown";
}
