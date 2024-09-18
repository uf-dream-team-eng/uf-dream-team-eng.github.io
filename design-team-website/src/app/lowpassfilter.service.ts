import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LowPassFilterService {
  private previousValue: number = 0;
  private alpha: number;

  constructor() {
    // Alpha is the smoothing factor, between 0 and 1. Higher value = smoother (but more lag)
    this.alpha = 0.3; // Adjust based on how much filtering you need
  }

  // Apply the LPF to a new value
  applyFilter(newValue: number): number {
    // Low pass filter formula: y[n] = alpha * x[n] + (1 - alpha) * y[n-1]
    const filteredValue =
      this.alpha * newValue + (1 - this.alpha) * this.previousValue;
    this.previousValue = filteredValue;
    return filteredValue;
  }

  // Optionally, you can expose a method to reset the filter
  reset() {
    this.previousValue = 0;
  }
}
