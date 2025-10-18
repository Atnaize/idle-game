import { BigNumber } from '@core/engine';

/**
 * NumberFormatter - Format big numbers for display
 */
export class NumberFormatter {
  private static readonly SUFFIXES = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg',
    'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Novg', 'Tg',
  ];

  /**
   * Format number with suffixes (K, M, B, T, etc.)
   */
  static format(value: BigNumber | number | string, decimals: number = 2): string {
    const num = BigNumber.from(value);

    if (num.lt(1000)) {
      // For numbers under 1000, show whole numbers if they're integers
      if (num.eq(num.floor())) {
        return num.toFixed(0);
      }
      return num.toFixed(decimals);
    }

    const exponent = Math.floor(Math.log10(num.toNumber()) / 3);
    const suffix = this.SUFFIXES[Math.min(exponent, this.SUFFIXES.length - 1)] || '';

    if (exponent >= this.SUFFIXES.length) {
      // Use scientific notation for very large numbers
      return num.toExponential(decimals);
    }

    const scaled = num.div(BigNumber.from(10).pow(exponent * 3));

    // For suffixed numbers, only show decimals if needed for clarity
    if (scaled.eq(scaled.floor())) {
      return `${scaled.toFixed(0)}${suffix}`;
    }
    return `${scaled.toFixed(decimals)}${suffix}`;
  }

  /**
   * Format number as rate (per second)
   */
  static formatRate(value: BigNumber | number | string, decimals: number = 2): string {
    return `${this.format(value, decimals)}/s`;
  }

  /**
   * Format time duration
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    }

    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}m ${secs}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Format percentage
   */
  static formatPercent(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format compact (shorter)
   */
  static formatCompact(value: BigNumber | number | string): string {
    return this.format(value, 1);
  }

  /**
   * Format for tooltips (more detail)
   */
  static formatDetailed(value: BigNumber | number | string): string {
    const num = BigNumber.from(value);

    if (num.lt(1e6)) {
      return num.toFixed(0);
    }

    return `${this.format(value, 3)} (${num.toExponential(2)})`;
  }

  /**
   * Convert Cost object to plain numbers for UI display
   * Handles BigNumber | number | string values
   */
  static costToNumbers(cost: Record<string, BigNumber | number | string>): Record<string, number> {
    const numbers: Record<string, number> = {};
    for (const [key, value] of Object.entries(cost)) {
      numbers[key] = BigNumber.from(value).toNumber();
    }
    return numbers;
  }
}
