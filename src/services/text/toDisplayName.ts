export function toDisplayName(identifier: string) {
  const words = identifier.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
