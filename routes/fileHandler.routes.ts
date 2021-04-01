import { Router } from 'express';
import { upload } from '../controller/fileHandler.controller';
import { multerFileEngine } from '../middleware/file-handler';

const router = Router();

router.post(
  '/upload/:accountDetection',
  multerFileEngine.single('file'),
  upload
);

export default router;
