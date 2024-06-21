export function uniqueIdCreator(prefix = "", suffix = "") {
  let id = 0;
  return () => `${prefix}${id++}${suffix}`;
}

export const uniqueId = uniqueIdCreator("id_");
