"use strict";
import tinify from 'tinify';
tinify.key = process.env.TINIFY_KEY;

export function compressImage (data) {
  return new Promise((resolve, reject) => {
    // strip metadata
    const matches = data.match(/^(data:.+;base64,)(.*)$/);
    const metadata = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    tinify.fromBuffer(buffer).toBuffer((error, compressedData) => {
      console.log('!!! compression count', tinify.compressionCount);
      if (error) {
        console.log('!!! image compress error', error);
        return reject(error);
      } else {
        const compressedBuffer = Buffer.from(compressedData);
        resolve(metadata + compressedBuffer.toString('base64'));
      }
    });
  });
}
