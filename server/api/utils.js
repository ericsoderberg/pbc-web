
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
