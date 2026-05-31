import type { StorageEngine } from "multer";

let cachedStorage: StorageEngine | null = null;

/** Lazy-load Cloudinary + multer storage to avoid startup cost when uploads are unused. */
export async function getCloudinaryStorage(): Promise<StorageEngine> {
  if (cachedStorage) return cachedStorage;
  const { storage } = await import("./cloudinary.config");
  cachedStorage = storage;
  return cachedStorage;
}
