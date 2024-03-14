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
  public array: number[] = []
  private window: number[] = []
  private windowLength = 30

  private cnt = 0;


  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Check that we are running in the browser so we can load plotly
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This code will only execute in the browser
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
      Plotly.newPlot('plot', [{
        y: [0],
        mode: 'lines',
        line: {color: '#80CAF6'}
      }]);
    };
    document.head.appendChild(script);
  }

  // Start updating the plot in real-time
  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 1); // Update every second
  }

  receiveData(data: Uint8Array): void{
    this.array = this.array.concat(data[0]);
    this.window = this.window.concat(data[0]);
    if(this.window.length > this.windowLength){
      this.window.splice(0, 1);
    }
    if(this.array.length == this.windowLength){
      this.startRealtimeUpdate();
    }

    console.log(this.window)
  }

  // Update the plot
  updatePlot(): void {   

    var data_update = {
      y: [this.window]
    };

    Plotly.update('plot', data_update)
  }

  // Clean up the interval when the component is destroyed
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}

