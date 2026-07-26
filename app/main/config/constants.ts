/**
 * Main process constants
 */

export const MAIN_CONSTANTS = {
  /** Application protocol for serving local images */
  IMAGE_PROTOCOL: 'neet-image',

  /** Maximum ZIP file size (500 MB) */
  MAX_ZIP_SIZE_BYTES: 500 * 1024 * 1024,

  /** Supported image extensions */
  SUPPORTED_IMAGE_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],

  /** Database connection pragmas */
  DB_PRAGMAS: {
    journal_mode: 'WAL',
    synchronous: 'NORMAL',
    cache_size: -64000, // 64MB
    mmap_size: 268435456, // 256MB memory mapped IO for rapid read
    foreign_keys: 'ON',
    temp_store: 'MEMORY',
  },
} as const;
