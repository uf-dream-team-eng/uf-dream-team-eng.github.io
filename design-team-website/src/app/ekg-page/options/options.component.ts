// Imports //
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
declare var navigator: Navigator;

// Angular Component //
@Component({
  selector: 'app-options',
  standalone: true,
  imports: [],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
})
export class OptionsComponent implements OnInit {
  Baudrate: number = 9600;
  DataBits: number = 8;
  Parity: string = 'none';
  StopBits: number = 1;

  port: any;
  reader: any;
  lineBuffer = '';
  isreading = false;

  @Output() data: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  // Check that we are running in the browser and that we are using chromium
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This code will only execute in the browser
      if (!(navigator as any).serial) {
        alert('Please Use Chrome or Edge!');
      }
    }
  }

  // Start the serial communication
  async open() {
    // Prompt the user to select a serial port
    this.port = await (navigator as any).serial.requestPort();

    // Try to open that port
    try {
      await this.port.open({
        baudRate: this.Baudrate,
        dataBits: this.DataBits,
        parity: this.Parity,
        stopBits: this.StopBits,
      });
    } catch (e) {
      await this.port.close();
      return Promise.reject(e);
    }

    // Begin Reading from that port
    this.isreading = true;
    this.cdr.detectChanges();
    console.log(this.isreading);
    this.read();
  }

  // Close the serial communication
  async close() {
    this.isreading = false;
    this.cdr.detectChanges();

    // If there is a reader cancel it and release the lock
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) {
        console.error(e);
      } finally {
        this.reader = null;
      }
    }

    // If there is a port close it
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
      } catch (e) {
        console.error(e);
      }
    }

    console.log('serial port closed');
  }

  // Read from the serial port
  async read() {
    // Make sure we are connected to a port
    if (this.port == null) {
      console.error('failed to read from serial port');
      return;
    }
    // While the port is readable
    while (this.port.readable && this.isreading) {
      // Creates a reader on the stream and locks it so no other readers can be acquired until this one is released.
      this.reader = this.port.readable.getReader();

      // Try to read from the reader
      try {
        // Constantly get data from the reader
        while (true) {
          const { value, done } = await this.reader.read();

          // Is there no more data to read?
          if (done) {
            break;
          }

          // Create a decoder since we are sending the data as ASCII strings
          let utf8decoder = new TextDecoder();
          let in_char = utf8decoder.decode(value);

          // Hold each received char until we get a new line
          this.lineBuffer += in_char;
          if (in_char === '\n') {
            // Once we get a new line emit the data and clear the line buffer
            this.data.emit(this.lineBuffer);
            this.lineBuffer = '';
          }
        }
      } catch (error) {
        console.log('error ' + error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }
}
