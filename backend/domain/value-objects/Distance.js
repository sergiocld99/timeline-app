import { BusinessRuleError } from "../../error/businessRuleError.js";

export class Distance {
  constructor(value, unit = 'km') {
    if (value < 0) {
      throw new BusinessRuleError('Distance must be positive');
    }

    this.value = value;
    this.unit = unit;
  }

  toString() {
    return `${this.value} ${this.unit}`;
  }
}