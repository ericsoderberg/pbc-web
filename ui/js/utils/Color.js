
const COLOR_RGB_REGEXP = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;

export function isDarkBackground(colorString) {
  // convert to RGB elements
  const match = colorString.match(COLOR_RGB_REGEXP);
  let result = false;
  if (match) {
    const [red, green, blue] = match.slice(1).map(n => parseInt(n, 10));
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
