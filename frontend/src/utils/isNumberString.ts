export function isNumberString(value: string) {
  const forbiddenCharsRexex = new RegExp("[^0-9,.]");
  const decimalsRegex = new RegExp("[.,]", "g");

  const numberOfDecimals = (value.match(decimalsRegex) || []).length;
  const hasMultipleDecimals = numberOfDecimals > 1;

  const hasInvalidValues = forbiddenCharsRexex.test(value);

  return !hasInvalidValues && !hasMultipleDecimals;
}
