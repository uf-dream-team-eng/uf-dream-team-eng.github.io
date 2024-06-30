import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AxisDataService {
  // Axis Data
  private fieldsSubject = new BehaviorSubject<{
    [key: string]: { data: string; units: string };
  }>({
    Position: { data: '0', units: 's' },
    Base: { data: '1', units: 's/div' },
    Offset: { data: '525', units: 'mv' },
    Range: { data: '105', units: 'mv/div' },
  });
  fields$ = this.fieldsSubject.asObservable();

  // Units
  private units_time: { [key: string]: number } = {
    hr: 60 * 60,
    min: 60,
    s: 1,
    ms: 1 / 1000,
    us: 1 / 1000000,
  };
  private units_voltage: { [key: string]: number } = {
    v: 1,
    mv: 1 / 1000,
    uv: 1 / 1000000,
  };

  // Helper Functions
  public parseInput(field: string, isDiv: boolean, input: string) {
    // Match user input
    const regex = /^\s*(-?\d*(\.\d+)?)\s*([a-zA-Z]+)?\s*(\/div)?\s*$/;
    const match = input.match(regex);

    // If we don't have a match we can't parse any input
    if (!match) {
      return false;
    }

    // Get the value and unit they typed
    const value = parseFloat(match[1]);
    const unit = match[3]?.toLowerCase();

    // Make sure we have valid inputs
    if ((isDiv && value === 0) || isNaN(value) || !unit) {
      return false;
    }

    // Find what units they are using (time or voltage)
    let unit_dict = this.units_time;
    if (unit in this.units_voltage) {
      unit_dict = this.units_voltage;
    }

    // Convert it to use just its base unit (no prefix)
    let convertedValue = value * unit_dict[unit];

    // If value = 0, set convertedValue to 1 so we get the base unit
    if (convertedValue == 0) {
      convertedValue = 1;
    }

    // Find the closest prefix and convert it to that
    // Go through the dictionary of units till you find the best one
    for (let unit in unit_dict) {
      if (Math.abs(convertedValue) >= unit_dict[unit]) {
        const convertedAmount = convertedValue / unit_dict[unit];
        // Check if the converted amount is "cleaner" than the original
        if (
          convertedAmount.toString().length <= value.toString().length ||
          (Number.isInteger(convertedAmount) && !Number.isInteger(value))
        ) {
          // Save the input
          const updatedFields = { ...this.fieldsSubject.value };
          updatedFields[field] = {
            data: (value == 0 ? 0 : convertedAmount).toString(),
            units: isDiv ? unit + '/div' : unit,
          };
          this.fieldsSubject.next(updatedFields);
          return true;
        }
      }
    }
    return false;
  }

  getString(field: string) {
    const fieldData = this.fieldsSubject.value[field];
    return fieldData ? `${fieldData.data} ${fieldData.units}` : '';
  }

  public unitConvert(value: string, oldUnit: string, newUnit: string) {
    // Given a value and its units convert it to be represented in new units
    let newValue = parseFloat(value);

    oldUnit = oldUnit.replace('/div', '').toLowerCase();
    newUnit = newUnit.replace('/div', '').toLowerCase();

    let unit_dict = this.units_time;
    if (oldUnit in this.units_voltage) {
      unit_dict = this.units_voltage;
    }

    newValue *= unit_dict[oldUnit] / unit_dict[newUnit];
    return newValue;
  }

  constructor() {}
}
