import { BusinessRuleError } from "../../error/businessRuleError.js";

export class Money {
  constructor(amount, currency = 'ARS') {
    if (amount < 0) {
      throw new BusinessRuleError('Amount must be positive');
    }

    this.amount = amount;
    this.currency = currency;
  }

  toString() {
    if (this.currency === 'ARS') {
      return `$${this.amount}`;
    }

    return `${this.amount} ${this.currency}`;
  }
}