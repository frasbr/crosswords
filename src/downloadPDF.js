import axios from 'axios';
import fs from 'fs';

export const downloadPDF = async (url, fileName) => {
  return axios.get(url, { responseType: 'stream' }).then(response => {
    const writeStream = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
      response.data.pipe(writeStream);
      let error = null;
      writeStream.on('error', err => {
        error = err;
        writeStream.close();
        reject(err);
      });
      writeStream.on('close', () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  });
}