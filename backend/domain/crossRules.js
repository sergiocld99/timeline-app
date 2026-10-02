import { BusinessRuleError } from "../error/businessRuleError.js";

export class CrossRules {
  static validateDeletable(travelsCount) {
    if (travelsCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete cross: It has ${travelsCount} associated travel(s).`
      );
    }
  }
}
