import { Component, OnInit, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
declare var navigator: Navigator; 

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent implements OnInit {
  Baudrate: number = 9600;
  port: any;
  reader: any;
  @Output() data: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    // Check that we are running in the browser so we can check if web serial api is in this browser
    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        // This code will only execute in the browser
        if(!(navigator as any).serial){
          alert("Please Use Chrome or Edge!")
        }
      }
    }

  async open(){
    this.port = await (navigator as any).serial.requestPort();
    try{
      await this.port.open({ baudRate: 9600 });
    } catch (e){
      await this.port.close();
      return Promise.reject(e);
    }
    this.read()
  }

  async read() {
    if (this.port == null) {
      console.error("failed to read from serial port");
      return;
    }
    while(this.port.readable){
      this.reader = this.port.readable.getReader();

      try{
        while (true) {
            const { value, done } = await this.reader.read();
    
            if (done) {
              this.reader.releaseLock();
              break;
            }
            
            if(value){
              this.data.emit(value)
            }
         }
        } catch (error){
          console.log("error " + error)
        }

    }
  }

}
