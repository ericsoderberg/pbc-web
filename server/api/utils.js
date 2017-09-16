
export const catcher = (error, res) => {
  console.error(error);
  res.status(error.status || 400).json(error);
};

export const getPostData = req =>
  new Promise((resolve, reject) => {
    if (req.readable) {
      let content = '';
      req.on('data', (data) => {
        if (content.length > 1e6) {
          // Flood attack or faulty client, nuke request.
          reject({ status: 413, error: 'Request entity too large.' });
        }
        content += data;
      });
      req.on('end', () => {
        const data = {};
        content.split('&').forEach((pair) => {
          const [name, value] = pair.split('=', 2);
          data[name] = decodeURIComponent(value);
        });
        resolve(data);
      });
    } else {
      resolve(req.body);
    }
  });

export const sendImage = (image, res) => {
  const matches = image.data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const img = new Buffer(matches[2], 'base64');
  res.writeHead(200, {
    'Content-Type': image.type,
    'Content-Length': img.length,
  });
  res.end(img);
};

export const unsetEmptyFields = (data, fieldNames) => {
  fieldNames.forEach((name) => {
    if (!data[name]) {
      delete data[name];
      if (!data.$unset) {
        data.$unset = {};
      }
      data.$unset[name] = '';
    }
  });
  return data;
};

const COLOR_HASH_SHORT_REGEXP = /#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})/;
const COLOR_HASH_REGEXP = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;
const COLOR_RGB_REGEXP = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
const COLOR_RGBA_REGEXP = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;

export const isDarkBackground = (color) => {
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
};

export const backgroundColor = (color) => {
  let result = '';
  if (color) {
    result = `background-color: ${color};`;
    if (isDarkBackground(color)) {
      result += ' color: #F2F2F2;';
    }
  // } else {
  //   result = 'border-top: 1px solid #CCCCCC; border-bottom: 1px solid #CCCCCC;';
  }
  return result;
};
