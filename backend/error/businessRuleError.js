export class BusinessRuleError extends Error {
  constructor(message, code, params) {
    super(message);
    this.name = 'BusinessRuleError';
    this.code = code;
    this.params = params;
  }
}
