import { Router } from 'express';
import { getStatus } from '../controller/system.controller';

const router = Router();

router.get('/', getStatus);

export default router;
