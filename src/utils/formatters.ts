export const formatCurrency = (val: number, showPlus: boolean = false): string => {
  const isNegative = val < 0;
  const absValue = Math.abs(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isNegative) {
    return `-$${absValue}`;
  }
  if (showPlus && val > 0) {
    return `+$${absValue}`;
  }
  return `$${absValue}`;
};

export const formatPercent = (val: number): string => {
  const isNegative = val < 0;
  const absValue = Math.abs(val).toFixed(2);
  return isNegative ? `-${absValue}%` : `+${absValue}%`;
};
