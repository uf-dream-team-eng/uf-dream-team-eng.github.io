import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OptionsComponent } from './options/options.component';
import { AxisControlComponent } from './axis-control/axis-control.component';
import { AxisDataService } from './axis-control/axis-data.service';
import { Subscription } from 'rxjs';
import { offset } from '@popperjs/core';
import { SerialService } from './options/serial.service';

declare var Plotly: any; // Declare Plotly to avoid TypeScript errors

@Component({
  selector: 'app-ekg-page',
  standalone: true,
  imports: [OptionsComponent, AxisControlComponent],
  templateUrl: './ekg-page.component.html',
  styleUrls: ['./ekg-page.component.scss'],
})
export class EkgPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('plot', { static: true }) plotElement!: ElementRef;

  private intervalId: any; // Interval identifier
  private axisSubscription: Subscription | undefined; // Subscription to axis data changes
  private dataSubscription: Subscription | undefined; // Subscription to serial data
  private connectionSubscription: Subscription | undefined; // Subscription to when we are connected via serial

  public isPaused: boolean = true;
  public isConnected: boolean = false;

  private startTime = new Date().getTime() / 1000;
  private sampleIndex = 0;

  private xArray: number[] = [];
  private yArray: number[] = [];

  private position: number = 0;
  private base: number = 0;
  private offset: number = 0;
  private range: number = 0;
  private baseUnit: string = '';
  private rangeUnit: string = '';

  private data = [
    {
      x: this.xArray,
      y: this.yArray,
      mode: 'lines',
      type: 'scatter',
    },
  ];
  private layout = {
    title: {
      text: 'EKG Signal Plot',
      font: {
        size: 24,
        family: 'Arial, sans-serif',
      },
    },
    xaxis: {
      title: {
        text: 'Time (s)',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
        },
        standoff: 20,
      },
      range: [this.position - 5 * this.base, this.position + 5 * this.base],
      zeroline: true,
      showline: true,
      mirror: true,
      ticks: 'outside',
      tickmode: 'linear',
      tick0: 0,
      dtick: this.base,
      ticklen: 5,
      tickwidth: 1,
      tickcolor: '#000',
      showgrid: true,
      gridcolor: '#e0e0e0',
      gridwidth: 1,
    },
    yaxis: {
      range: [this.offset - 5 * this.range, this.offset + 5 * this.range],
      title: {
        text: 'Voltage (mV)',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
        },
        standoff: 20,
      },
      zeroline: true,
      showline: true,
      mirror: 'ticks',
      ticks: 'outside',
      tickmode: 'linear',
      tick0: 0,
      dtick: this.range,
      ticklen: 5,
      tickwidth: 1,
      tickcolor: '#000',
      showgrid: true,
      gridcolor: '#e0e0e0',
      gridwidth: 1,
    },
    margin: { l: 80, r: 50, t: 50, b: 80 },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    dragmode: 'pan',
    font: {
      family: 'Arial, sans-serif',
    },
    showlegend: false,
  };
  private config = {
    responsive: true,
    displayModeBar: false,
    doubleClick: false,
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public axisDataService: AxisDataService,
    private serialService: SerialService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This code will only execute in the browser
      this.loadPlotly();
    }
    this.dataSubscription = this.serialService.data$.subscribe((newSamples) => {
      // Check if we are paused
      if (this.isPaused) {
        return;
      }

      // Process new samples
      // Get the current time make sure to change the units to match
      const currentTime =
        this.axisDataService.unitConvert(
          new Date().getTime().toString(),
          'ms',
          this.baseUnit
        ) - this.startTime;

      // Get the current voltage make sure to change the units to match
      const currentVoltage = this.axisDataService.unitConvert(
        (newSamples / 1024).toString(),
        'v',
        this.rangeUnit
      );

      // Save the samples
      this.xArray[this.sampleIndex] = currentTime;
      this.yArray[this.sampleIndex] = currentVoltage;

      // Check to see if we are outside the window
      this.sampleIndex++;
      if (currentTime > this.position + 5 * this.base) {
        // If we are start back at the start of the window
        this.xArray.length = this.sampleIndex + 1;
        this.yArray.length = this.sampleIndex + 1;

        this.sampleIndex = 0;
        this.startTime =
          this.axisDataService.unitConvert(
            new Date().getTime().toString(),
            'ms',
            this.baseUnit
          ) +
          (this.position + 5 * this.base);
      }
    });
    this.connectionSubscription = this.serialService.isConnected$.subscribe(
      (isConnected) => {
        // Pause if we are no longer connected
        this.isPaused = !isConnected;
        this.isConnected = isConnected;

        this.sampleIndex = 0;
        this.startTime =
          this.axisDataService.unitConvert(
            new Date().getTime().toString(),
            'ms',
            this.baseUnit
          ) +
          (this.position + 5 * this.base);
      }
    );
  }

  loadPlotly(): void {
    // Load Plotly script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
    script.onload = () => {
      // Plotly script loaded, init the plot
      Plotly.newPlot(
        this.plotElement?.nativeElement,
        this.data,
        this.layout,
        this.config
      );
      // Subscribe to axis data changes
      this.axisSubscription = this.axisDataService.fields$.subscribe((data) => {
        // Update the data
        this.isPaused = true;

        this.xArray.map((x, index) => {
          this.xArray[index] = this.axisDataService.unitConvert(
            x.toString(),
            this.baseUnit,
            data['Base']['units']
          );
        });
        this.yArray.map((y, index) => {
          this.yArray[index] = this.axisDataService.unitConvert(
            y.toString(),
            this.rangeUnit,
            data['Range']['units']
          );
        });

        // Get new values
        this.position = this.axisDataService.unitConvert(
          data['Position']['data'],
          data['Position']['units'],
          data['Base']['units']
        );
        this.base = parseFloat(data['Base']['data']);
        this.offset = this.axisDataService.unitConvert(
          data['Offset']['data'],
          data['Offset']['units'],
          data['Range']['units']
        );
        this.range = parseFloat(data['Range']['data']);
        this.baseUnit = data['Base']['units'].replace('/div', '');
        this.rangeUnit = data['Range']['units'].replace('/div', '');

        // Update the layout with new axis data
        this.layout.xaxis.range = [
          this.position - 5 * this.base,
          this.position + 5 * this.base,
        ];
        this.layout.xaxis.dtick = this.base;
        this.layout.xaxis.title.text = this.baseUnit;

        this.layout.yaxis.range = [
          this.offset - 5 * this.range,
          this.offset + 5 * this.range,
        ];
        this.layout.yaxis.dtick = this.range;
        this.layout.yaxis.title.text = this.rangeUnit;

        this.isPaused = false;
        this.updatePlot();
      });
      this.startRealtimeUpdate();
    };
    document.head.appendChild(script);
  }

  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 60); // Update every 60 milliseconds
  }

  updatePlot(): void {
    Plotly.update(
      this.plotElement?.nativeElement,
      this.data,
      this.layout,
      this.config
    );
  }

  @HostListener('plotly_relayout')
  public onRelayout() {
    console.log('hello?');
    console.log(this.layout.yaxis.range);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.axisSubscription) {
      this.axisSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  export(): void {
    const header = [
      'X Axis (' + this.baseUnit + ')',
      'Y Axis (' + this.rangeUnit + ')',
    ]; // CSV header row
    const filename = 'ECG_Data.csv';

    // Combine x-axis and y-axis data into CSV rows
    const csvData = this.xArray.map((x, index) => [x, this.yArray[index]]);

    // Format data as CSV
    const csv = [header.join(','), ...csvData.map((row) => row.join(','))].join(
      '\n'
    );

    // Create a Blob object for the CSV content
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create a download link element
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Set URL for the Blob object
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);

      // Append link to the body
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
    } else {
      alert('Your browser does not support downloading files.');
    }
  }
}
