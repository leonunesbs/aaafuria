// Define a function that takes a string from HTML and returns a clean string
export function cleanString(str: string): string {
  return str
    .replace(/(\r|\n|\r)/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
