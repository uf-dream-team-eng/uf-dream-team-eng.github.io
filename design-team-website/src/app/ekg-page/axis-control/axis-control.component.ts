import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AxisDataService } from './axis-data.service';

@Component({
  selector: 'app-axis-control',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './axis-control.component.html',
  styleUrls: ['./axis-control.component.scss'],
})
export class AxisControlComponent implements OnInit {
  constructor(public axisDataService: AxisDataService) {}

  public baseOptions = [
    '1 hr/div',
    '30 min/div',
    '12 min/div',
    '6 min/div',
    '2 min/div',
    '1 min/div',
    '30 s/div',
    '12 s/div',
    '6 s/div',
    '2 s/div',
    '1 s/div',
    '500 ms/div',
    '200 ms/div',
    '100 ms/div',
    '50 ms/div',
    '50 ms/div',
    '20 ms/div',
    '10 ms/div',
    '5 ms/div',
    '2 ms/div',
    '1 ms/div',
  ];
  public rangeOptions = [
    '1 V/div',
    '500 mV/div',
    '200 mV/div',
    '100 mV/div',
    '50 mV/div',
    '20 mV/div',
    '10 mV/div',
    '5 mV/div',
    '2 mV/div',
    '1 mV/div',
    '500 uV/div',
    '200 uV/div',
  ];
  public offsetOptions = [
    '1 V',
    '500 mV',
    '200 mV',
    '100 mV',
    '50 mV',
    '20 mV',
    '10 mV',
    '5 mV',
    '2 mV',
    '0 V',
    '-2 mV',
    '-5 mV',
    '-10 mV',
    '-20 mV',
    '-50 mV',
    '-100 mV',
    '-200 mV',
    '-500 mV',
    '-1 V',
  ];
  public positionOptions = [
    '1 hr',
    '30 min',
    '12 min',
    '6 min',
    '2 min',
    '1 min',
    '30 s',
    '12 s',
    '6 s',
    '2 s',
    '1 s',
    '500 ms',
    '200 ms',
    '100 ms',
    '50 ms',
    '20 ms',
    '10 ms',
    '5 ms',
    '2 ms',
    '1 ms',
    '0 s',
    '-1 ms',
    '-2 ms',
    '-5 ms',
    '-10 ms',
    '-20 ms',
    '-50 ms',
    '-100 ms',
    '-200 ms',
    '-500 ms',
    '-1 s',
    '-2 s',
    '-6 s',
    '-12 s',
    '-30 s',
    '-1 min',
    '-2 min',
    '-6 min',
    '-12 min',
    '-30 min',
    '-1 hr',
  ];

  public inputFields: { [key: string]: string } = {};

  ngOnInit(): void {
    this.axisDataService.fields$.subscribe((data) => {
      for (const key in data) {
        this.inputFields[key] = `${data[key].data} ${data[key].units}`;
      }
      this.save();
    });
  }

  trackByFn(index: number, item: any) {
    return index; // or item.id
  }

  public convert(field: string, isDiv: boolean) {
    this.axisDataService.parseInput(field, isDiv, this.inputFields[field]);
    this.save();
  }

  save() {
    for (let field in this.inputFields) {
      this.inputFields[field] = this.axisDataService.getString(field);
    }
  }
}
