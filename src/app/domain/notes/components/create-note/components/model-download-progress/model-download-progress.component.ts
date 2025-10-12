import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-model-download-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-download-progress.component.html',
  styleUrl: './model-download-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelDownloadProgressComponent {
  readonly progress = input.required<number>(); // 0-100
  readonly downloadedSize = input<number | undefined>();
  readonly totalSize = input<number | undefined>();
  readonly showLabel = input<boolean>(true);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly formattedDownloadedSize = computed(() => {
    const size = this.downloadedSize();
    if (!size) return '';
    return this.formatBytes(size);
  });

  readonly formattedTotalSize = computed(() => {
    const size = this.totalSize();
    if (!size) return '';
    return this.formatBytes(size);
  });

  readonly progressLabel = computed(() => {
    const progress = this.progress();
    const downloaded = this.formattedDownloadedSize();
    const total = this.formattedTotalSize();

    if (downloaded && total) {
      return `${Math.round(progress)}% (${downloaded} / ${total})`;
    }

    return `${Math.round(progress)}%`;
  });

  readonly barHeight = computed(() => {
    const size = this.size();
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  });

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }
}
