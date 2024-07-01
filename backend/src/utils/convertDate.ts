export function convertDate(value: string) {
  return new Date(value).toISOString().split("T")[0]!;
}
