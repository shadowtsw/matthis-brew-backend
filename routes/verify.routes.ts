import { Router } from 'express';
import {
  verifyAccount,
  resetPassword,
  resetVerifyToken,
} from '../controller/verify.controller';

const router = Router();

router.get('/verifyAccount/:accountID/:emailToken', verifyAccount);
router.get('/verifyResetAccount/newVerifyMail/:emailAddress', resetVerifyToken);
router.post('/passwordReset/:resetCode', resetPassword);

export default router;
