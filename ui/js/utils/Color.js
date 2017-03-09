
const COLOR_HASH_SHORT_REGEXP = /#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})/;
const COLOR_HASH_REGEXP = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;
const COLOR_RGB_REGEXP = /rgb\((\d+), (\d+), (\d+)\)/;
const COLOR_RGBA_REGEXP = /rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/;

export function isDarkBackground(color) {
  // convert to RGB elements
  const match = color.match(COLOR_RGB_REGEXP) ||
    color.match(COLOR_RGBA_REGEXP) || color.match(COLOR_HASH_REGEXP) ||
    color.match(COLOR_HASH_SHORT_REGEXP);
  let result = false;
  if (match) {
    const [red, green, blue] = match.slice(1).map(n => parseInt(n, 16));
    // http://www.had2know.com/technology/
    //  color-contrast-calculator-web-design.html
    const brightness = (
      (299 * red) + (587 * green) + (114 * blue)
    ) / 1000;
    if (brightness < 125) {
      result = true;
    }
  }
  return result;
}
