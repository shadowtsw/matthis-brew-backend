import ExpressMiddleWare from '../models/express-middleware.interface';
import User, { UserInterface } from '../models/user.schema';
import { verifyToken } from '../utils/jwt/jwt';
import { errName } from '../utils/error/error-handler';

export const authMiddleWare: ExpressMiddleWare = async (req, res, next) => {
  //check if header auth is present, else forward
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.user = null;
    req.loggedIn = false;
    return next();
  }
  //extract token and validate length
  const token = authHeader.split(' ')[1];
  if (!token || token.length < 10) {
    console.error('No valid header token');
    return next(new Error(errName.AUTH_FAILED));
  }

  const userData = verifyToken(token);

  //check for user data
  if (!userData) {
    console.error('Token authentication failed');
    return next(new Error(errName.AUTH_FAILED));
  }

  try {
    const findUser = await User.findOne({ username: userData.username }).exec();
    if (!findUser) {
      console.error('No valid user found !');
      throw new Error(errName.AUTH_FAILED);
    }
    req.loggedIn = true;
    req.user = findUser;
  } catch (error) {
    return next(error);
  }

  return next();
};
