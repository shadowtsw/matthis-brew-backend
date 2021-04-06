import { getStartTime } from '../utils/systemStatus';
import ExpressMiddleWare from '../models/express-middleware.interface';
import { errName } from '../utils/error/error-handler';

export const getStatus: ExpressMiddleWare = (req, res, next) => {
  if (!req.user) {
    const err = new Error(errName.AUTH_FAILED);
    return next(err);
  }
  res.json({ status: `Server is running ! Time:${getStartTime.get()}` });
};
