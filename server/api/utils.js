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
