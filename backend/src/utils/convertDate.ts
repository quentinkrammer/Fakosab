export function convertDate(value: Date) {
  return value.toISOString().split("T")[0]!;
}
