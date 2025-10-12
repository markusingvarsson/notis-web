import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ModelStatusInfo } from './transcription.types';

const MODEL_STATUS_KEY = 'whisper-model-status';
const MODEL_CACHE_NAME = 'transformers-cache';

/**
 * Service to manage Whisper model download status
 * Tracks download state, progress, and provides methods for model management
 */
@Injectable({
  providedIn: 'root',
})
export class WhisperModelStatusService {
  #platformId = inject(PLATFORM_ID);

  // Signal for reactive model status
  readonly modelStatus = signal<ModelStatusInfo>(this.loadStoredStatus());

  // Computed signals for common checks
  readonly isDownloaded = computed(
    () => this.modelStatus().status === 'downloaded'
  );

  readonly isDownloading = computed(
    () => this.modelStatus().status === 'downloading'
  );

  readonly hasError = computed(() => this.modelStatus().status === 'error');

  readonly downloadProgress = computed(() => this.modelStatus().progress);

  /**
   * Load stored model status from localStorage
   */
  private loadStoredStatus(): ModelStatusInfo {
    if (!isPlatformBrowser(this.#platformId)) {
      return this.getDefaultStatus();
    }

    try {
      const stored = localStorage.getItem(MODEL_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ModelStatusInfo;
        // Reset downloading status on page load (in case of interrupted download)
        if (parsed.status === 'downloading') {
          return {
            ...parsed,
            status: 'not-downloaded',
            progress: 0,
          };
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load model status:', error);
    }

    return this.getDefaultStatus();
  }

  /**
   * Get default model status
   */
  private getDefaultStatus(): ModelStatusInfo {
    return {
      status: 'not-downloaded',
      progress: 0,
    };
  }

  /**
   * Update model status and persist to localStorage
   */
  updateStatus(updates: Partial<ModelStatusInfo>): void {
    const current = this.modelStatus();
    const updated: ModelStatusInfo = {
      ...current,
      ...updates,
    };

    this.modelStatus.set(updated);
    this.persistStatus(updated);
  }

  /**
   * Set download progress
   */
  setDownloadProgress(progress: number, loaded?: number, total?: number): void {
    this.updateStatus({
      status: 'downloading',
      progress: Math.round(progress),
      downloadedSize: loaded,
      totalSize: total,
    });
  }

  /**
   * Mark model as downloaded
   */
  markAsDownloaded(): void {
    this.updateStatus({
      status: 'downloaded',
      progress: 100,
      lastDownloaded: new Date().toISOString(),
      error: undefined,
    });
  }

  /**
   * Mark model download as failed
   */
  markAsError(error: string): void {
    this.updateStatus({
      status: 'error',
      error,
    });
  }

  /**
   * Reset model status to not-downloaded
   */
  resetStatus(): void {
    this.modelStatus.set(this.getDefaultStatus());
    this.persistStatus(this.getDefaultStatus());
  }

  /**
   * Persist status to localStorage
   */
  private persistStatus(status: ModelStatusInfo): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    try {
      localStorage.setItem(MODEL_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to persist model status:', error);
    }
  }

  /**
   * Check if model exists in browser cache
   * This is a best-effort check using the Cache API
   */
  async checkModelInCache(): Promise<boolean> {
    if (!isPlatformBrowser(this.#platformId) || !('caches' in window)) {
      return false;
    }

    try {
      const cache = await caches.open(MODEL_CACHE_NAME);
      const keys = await cache.keys();

      // Check if any cached entries exist that match the Whisper model pattern
      const hasModel = keys.some(
        (request) =>
          request.url.includes('Xenova') && request.url.includes('whisper')
      );

      return hasModel;
    } catch (error) {
      console.error('Failed to check model cache:', error);
      return false;
    }
  }

  /**
   * Delete model from cache
   */
  async deleteModel(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId) || !('caches' in window)) {
      return;
    }

    try {
      // Delete the entire transformers cache
      await caches.delete(MODEL_CACHE_NAME);
      this.resetStatus();
    } catch (error) {
      console.error('Failed to delete model cache:', error);
      throw new Error('Failed to delete model');
    }
  }

  /**
   * Estimate model size (approximate for whisper-tiny.en)
   */
  getEstimatedModelSize(): number {
    // Whisper tiny.en is approximately 40-45MB
    return 42 * 1024 * 1024; // 42MB in bytes
  }

  /**
   * Get formatted model size string
   */
  getFormattedModelSize(): string {
    const bytes = this.getEstimatedModelSize();
    const mb = bytes / (1024 * 1024);
    return `~${Math.round(mb)}MB`;
  }

  /**
   * Verify model status matches cache state
   * Useful for detecting if cache was cleared externally
   */
  async verifyModelStatus(): Promise<void> {
    const storedStatus = this.modelStatus();
    const inCache = await this.checkModelInCache();

    // If status says downloaded but not in cache, reset status
    if (storedStatus.status === 'downloaded' && !inCache) {
      console.warn('Model status mismatch detected, resetting status');
      this.resetStatus();
    }
  }
}
