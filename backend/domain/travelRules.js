import { BusinessRuleError } from "../error/businessRuleError.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class TravelRules {
  static validateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;

    if (durationMs > ONE_DAY_MS) {
      throw new BusinessRuleError('Travel duration cannot exceed 24 hours');
    }

    if (durationMs < 0) {
      throw new BusinessRuleError('Travel duration cannot be negative');
    }

    if (durationMs === 0) {
      throw new BusinessRuleError('Travel duration cannot be zero');
    }
  }
}