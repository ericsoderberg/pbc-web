import tinify from 'tinify';

tinify.key = process.env.TINIFY_KEY;

export function compressImage(data) {
  if (tinify.key) {
    return new Promise((resolve, reject) => {
      // strip metadata
      const matches = data.match(/^(data:.+;base64,)(.*)$/);
      const metadata = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      tinify.fromBuffer(buffer).toBuffer((error, compressedData) => {
        // console.log('!!! compression count', tinify.compressionCount);
        if (error) {
          console.error('!!! image compress error', error);
          return reject(error);
        }
        const compressedBuffer = Buffer.from(compressedData);
        return resolve(metadata + compressedBuffer.toString('base64'));
      });
    });
  }
  return Promise.resolve(data);
}
