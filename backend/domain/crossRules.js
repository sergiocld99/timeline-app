import { BusinessRuleError } from "../error/businessRuleError.js";

export class CrossRules {
  static validateDeletable(travelsCount, blockingTravelDate) {
    if (travelsCount === 1) {
      throw new BusinessRuleError(
        `Cannot delete cross: Its only associated travel is from ${blockingTravelDate}.`,
        'cross_has_associated_travel',
        { count: travelsCount, date: blockingTravelDate }
      );
    }

    if (travelsCount > 1) {
      throw new BusinessRuleError(
        `Cannot delete cross: It has ${travelsCount} associated travels.`,
        'cross_has_associated_travels',
        { count: travelsCount }
      );
    }
  }
}
