import type { Weighted } from "../../types/commons";

import { getFixedPercentage } from "..";

const getPercentagesByColor = (sourceArr: Weighted[]) => sourceArr.reduce((sum, elem) => {
  sum[elem.weight.color] += elem.weight.percentage;
  return sum;
}, {
  '🔴': 0,
  '🟠': 0,
  '🟡': 0,
  '🟢': 0
});

export const renderWeight = (elem: Weighted) => (`${elem.weight.color} ${getFixedPercentage(elem.weight.percentage)}`)

export const renderTotalWeightsCell = (sourceArr: Weighted[]) => {
  const percentagesByColor = getPercentagesByColor(sourceArr)

  const colors = ['🔴', '🟠', '🟡', '🟢'] as const;

  return colors.map(color => {
    const percentage = percentagesByColor[color];

    if (percentage === 0) return null;

    return (
      <>
        {color} {getFixedPercentage(percentage)} <br />
      </>
    )
  })
}