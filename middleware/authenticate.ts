import ExpressMiddleWare from '../models/express-middleware.interface';
import User, { UserInterface } from '../models/user.schema';
import { verifyToken } from '../utils/jwt/jwt';

export const authMiddleWare: ExpressMiddleWare = async (req, res, next) => {
  //check if header auth is present, else forward
  let error = {
    status: 500,
    message: '',
  };

  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.user = null;
    req.loggedIn = false;
    return next();
  }
  //extract token and validate length
  const token = authHeader.split(' ')[1];
  if (!token || token.length < 5) {
    error.status = 400;
    error.message = 'No valid authorization input !';
    return next(error);
  }

  const userData = verifyToken(token);

  //check for user data
  if (!userData) {
    error.status = 401;
    error.message = 'Authentication failed !';
    return next(error);
  }

  try {
    const findUser = await User.findOne({ username: userData.username }).exec();
    if (!findUser) {
      error.status = 401;
      error.message = 'Authentication failed !';
    }
    req.loggedIn = true;
    req.user = findUser;
  } catch (error) {
    return next(error);
  }

  return next();
};
