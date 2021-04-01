import { Request, Response, NextFunction } from 'express';
import { UserInterface } from './user.schema';

type ExtendedRequest = Request & {
  loggedIn?: boolean;
  user?: UserInterface | null | string;
  admin?: boolean;
  test?: any;
};

type ExpressMiddleWare = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => void;

export default ExpressMiddleWare;
