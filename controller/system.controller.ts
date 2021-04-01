import { getStartTime } from '../utils/systemStatus';
import ExpressMiddleWare from '../models/express-middleware.interface';

export const getStatus: ExpressMiddleWare = (req, res, next) => {
  res.json({ status: `Server is running ! Time:${getStartTime.get()}` });
};
