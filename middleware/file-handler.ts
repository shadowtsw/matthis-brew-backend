import multer from 'multer';
import path from 'path';

const mainDir = require.main!.path.toString();
let pathDir = path.join(mainDir, 'files');

export const csvFilter = (req: any, file: any, callback: any) => {
  if (file.mimetype.includes('csv')) {
    if (file.originalname === 'test') {
      callback('File already exists', false);
    } else {
      callback(null, true);
    }
  } else {
    callback('No valid file format', false);
  }
};

export const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    //console.log('pathDir', pathDir);
    callback(null, pathDir);
  },
  filename: (req, file, callback) => {
    //console.log('fileName', file.originalname);
    callback(null, file.originalname);
  },
});

export const multerFileEngine = multer({
  storage: storage,
  fileFilter: csvFilter,
});
