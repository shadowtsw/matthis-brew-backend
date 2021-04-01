import ExpressMiddleWare from '../models/express-middleware.interface';
import path from 'path';
import fs from 'fs';
import papaParse from 'papaparse';

const mainDir = require.main!.path.toString();
let pathDir = path.join(mainDir, 'files');

export const upload: ExpressMiddleWare = async (req, res, next) => {
  console.log('upload arrives');
  let arrayToTransform: Array<any> = [];
  try {
    if (!req.file) {
      return res.status(400).send('File is missing');
    }
    fs.createReadStream(path.join(pathDir, req.file.filename), {
      encoding: 'utf8',
    })
      .pipe(papaParse.parse(papaParse.NODE_STREAM_INPUT, { header: true }))
      .on('error', (err) => {
        return res.status(500).send('Parsing file fails !');
      })
      .on('data', (row) => {
        arrayToTransform.push(row);
      })
      .on('end', () => {
        try {
          console.log(arrayToTransform);
        } catch (err) {
          return next(err);
        }
        res.status(200).send('File successfully uploaded');
      });
  } catch (err) {
    next(err);
  }
};
