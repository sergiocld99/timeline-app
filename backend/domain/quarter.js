import { BusinessRuleError } from "../error/businessRuleError.js";

const QUARTER_PATTERN = /^(\d{4})-Q([1-4])$/;

export const parseQuarter = (quarterStr) => {
  const match = QUARTER_PATTERN.exec(quarterStr ?? '');

  if (!match) {
    throw new BusinessRuleError(`Invalid quarter format: "${quarterStr}". Expected YYYY-Qn, e.g. 2023-Q1`);
  }

  const year = parseInt(match[1], 10);
  const quarterNumber = parseInt(match[2], 10);
  const startMonth = (quarterNumber - 1) * 3;

  const dateFrom = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
  const dateTo = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));

  return { dateFrom, dateTo };
};

export const getQuarterKey = (date) => {
  const year = date.getUTCFullYear();
  const quarterNumber = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarterNumber}`;
};
