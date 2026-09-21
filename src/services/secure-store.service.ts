import { secureStorageService } from './storage';

/**
 * Re-export secureStorageService and alias secureStoreService for backwards compatibility.
 */
export { secureStorageService };
export const secureStoreService = secureStorageService;
