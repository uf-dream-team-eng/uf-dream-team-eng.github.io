import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OptionsComponent } from './options/options.component';

declare var Plotly: any; // Declare Plotly to avoid TypeScript errors

@Component({
  selector: 'app-ekg-page',
  standalone: true,
  imports: [OptionsComponent],
  templateUrl: './ekg-page.component.html',
  styleUrl: './ekg-page.component.scss'
})

export class EkgPageComponent implements OnInit {

  // Vars
  private intervalId: any; // Interval identifier
  private window: number[] = [];
  private timestamps: number[] = []; // Array to store timestamps in milliseconds
  private startTime: number = 0; // Store the start time in milliseconds

  private windowLength = 500;
  private plotLayout = { title: "EKG Signal Plot" };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Check that we are running in the browser so we can load plotly
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This code will only execute in the browser
      this.startTime = Date.now(); // Store the start time
      this.loadPlotly();
    }
  }

  // Load Plotly in using the cdn
  loadPlotly(): void {
    // Load Plotly script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
    script.onload = () => {
      // Plotly script loaded, init the plot
      Plotly.newPlot('plot', [{ y: this.window }], this.plotLayout);
    };
    document.head.appendChild(script);
  }

  // Start updating the plot in real-time
  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 60); // Update every millisecond
  }

  receiveData(data: any): void {
    if (this.window.length === 0) {
      this.startRealtimeUpdate();
    }

    const newData = parseFloat(data);
    const now = Date.now(); // Current timestamp in milliseconds
    const timestampSinceStart = now - this.startTime; // Time since start in milliseconds
    this.timestamps.push(timestampSinceStart); // Store the timestamp
    this.window.push(newData);

    if (this.window.length > this.windowLength) {
      this.window.shift(); // Remove oldest data point
      this.timestamps.shift(); // Remove oldest timestamp
    }
  }

  // Update the plot
  updatePlot(): void {
    Plotly.newPlot('plot', [{
      x: this.timestamps, // Use timestamps as x-axis data
      y: this.window
    }], this.plotLayout);
  }

  // Clean up the interval when the component is destroyed
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
