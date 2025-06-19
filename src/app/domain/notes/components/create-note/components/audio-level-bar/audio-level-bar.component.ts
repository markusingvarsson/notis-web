import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-audio-level-bar',
  standalone: true,
  template: `
    <div class="flex justify-center">
      <div class="relative">
        <!-- Enhanced audio level bar container -->
        <div
          class="w-40 h-6 bg-gray-800/50 backdrop-blur-sm rounded-full overflow-hidden border border-gray-600/30 shadow-lg"
        >
          <!-- Animated background gradient -->
          <div
            class="absolute inset-0 rounded-full animate-pulse"
            [class]="backgroundGradientClass()"
            [style.opacity]="backgroundOpacity()"
          ></div>

          <!-- Main audio level bar with amazing gradient -->
          <div
            class="h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden"
            [class]="barGradientClass()"
            [style.width.%]="audioLevelPercentage()"
          >
            <!-- Shimmer effect -->
            <div
              class="absolute inset-0 rounded-full animate-pulse"
              [class]="shimmerClass()"
              [style.animation-duration]="shimmerDuration() + 's'"
            ></div>

            <!-- Sparkle effect -->
            <div
              class="absolute inset-0 rounded-full"
              [style.background]="sparkleGradient()"
              [style.animation-duration]="sparkleDuration() + 's'"
            ></div>
          </div>
        </div>

        <!-- Audio level text -->
        <div
          class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium"
        >
          <span [class]="levelTextClass()">
            {{ audioLevelText() }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AudioLevelBarComponent {
  readonly voiceLevel = input.required<number>();

  // Computed signals for all audio level properties
  readonly audioLevelPercentage = computed(() => {
    return Math.max(this.voiceLevel(), 0.05) * 100;
  });

  readonly barGradientClass = computed(() => {
    const level = this.voiceLevel();
    if (level < 0.3)
      return 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400';
    if (level < 0.6)
      return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400';
    if (level < 0.8)
      return 'bg-gradient-to-r from-orange-400 via-orange-500 to-red-400';
    return 'bg-gradient-to-r from-red-400 via-red-500 to-pink-400';
  });

  readonly backgroundGradientClass = computed(() => {
    const level = this.voiceLevel();
    if (level < 0.3) return 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20';
    if (level < 0.6)
      return 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20';
    if (level < 0.8) return 'bg-gradient-to-r from-orange-900/20 to-red-900/20';
    return 'bg-gradient-to-r from-red-900/20 to-pink-900/20';
  });

  readonly backgroundOpacity = computed(() => {
    return Math.max(this.voiceLevel(), 0.1) * 0.3 + 0.1;
  });

  readonly shimmerClass = computed(() => {
    const level = this.voiceLevel();
    if (level < 0.3)
      return 'bg-gradient-to-r from-transparent via-blue-200/40 to-transparent';
    if (level < 0.6)
      return 'bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent';
    if (level < 0.8)
      return 'bg-gradient-to-r from-transparent via-orange-200/40 to-transparent';
    return 'bg-gradient-to-r from-transparent via-red-200/40 to-transparent';
  });

  readonly shimmerDuration = computed(() => {
    return Math.max(2 - this.voiceLevel(), 0.5);
  });

  readonly sparkleGradient = computed(() => {
    const level = this.voiceLevel();
    const opacity = Math.max(level * 0.5, 0.1);
    if (level < 0.3)
      return `linear-gradient(45deg, transparent 30%, rgba(96, 165, 250, ${opacity}) 50%, transparent 70%)`;
    if (level < 0.6)
      return `linear-gradient(45deg, transparent 30%, rgba(251, 191, 36, ${opacity}) 50%, transparent 70%)`;
    if (level < 0.8)
      return `linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, ${opacity}) 50%, transparent 70%)`;
    return `linear-gradient(45deg, transparent 30%, rgba(248, 113, 113, ${opacity}) 50%, transparent 70%)`;
  });

  readonly sparkleDuration = computed(() => {
    return Math.max(1.5 - this.voiceLevel(), 0.3);
  });

  readonly levelTextClass = computed(() => {
    const level = this.voiceLevel();
    if (level < 0.3) return 'text-blue-400';
    if (level < 0.6) return 'text-yellow-400';
    if (level < 0.8) return 'text-orange-400';
    return 'text-red-400';
  });

  readonly audioLevelText = computed(() => {
    const level = this.voiceLevel();
    if (level < 0.3) return 'Low';
    if (level < 0.6) return 'Medium';
    if (level < 0.8) return 'High';
    return 'Loud';
  });
}
