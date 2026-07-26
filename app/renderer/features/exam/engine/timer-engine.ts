/**
 * TimerEngine interface
 * Manages countdown, time warnings, and drift correction
 */

export interface TimerEngine {
  /**
   * Initializes the timer
   * @param totalDurationSeconds The initial total duration
   * @param remainingSeconds The time remaining (for resume)
   * @param onTick Callback fired every second with remaining time
   * @param onTimeUp Callback fired when time reaches zero
   */
  initialize(
    totalDurationSeconds: number,
    remainingSeconds: number,
    onTick: (remainingSeconds: number) => void,
    onTimeUp: () => void
  ): void;

  /**
   * Starts or resumes the countdown
   */
  start(): void;

  /**
   * Pauses the countdown
   */
  pause(): void;

  /**
   * Gets the current remaining time in seconds
   */
  getRemainingSeconds(): number;
}
