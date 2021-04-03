import { getStartTime } from '../utils/systemStatus';
import ExpressMiddleWare from '../models/express-middleware.interface';
import { verifyEmailToken, createVerifyToken } from '../utils/jwt/jwt';
import { errName } from '../utils/error/error-handler';
import User from '../models/user.schema';
import path from 'path';
import { messageTemplate } from '../utils/verify/verifyMessage-template';

export const verifyAccount: ExpressMiddleWare = async (req, res, next) => {
  const accountID = req.params.accountID;
  const emailToken = req.params.emailToken;

  const verifiedData = verifyEmailToken(emailToken);

  if (!verifiedData) {
    const error = new Error(errName.TOKEN_EXPIRED);
    return next(error);
  }
  if (verifiedData.accountID !== accountID) {
    const error = new Error(errName.DEFAULT);
    return next(error);
  }
  try {
    const activateAccount = await User.findById(accountID).exec();
    if (!activateAccount) {
      throw new Error(errName.USER_NOT_FOUND);
    }
    activateAccount.meta.isVerified = true;
    activateAccount.meta.resetToken = null;
    await activateAccount.save();
    res
      .status(200)
      .sendFile(path.resolve(__dirname, '..', 'pages', 'verifiedPage.html'));
  } catch (err) {
    return next(err);
  }
};

export const resetPassword: ExpressMiddleWare = (req, res, next) => {
  const body = req.body;
  const resetCode = req.params.resetCode;

  console.log('body', body, 'resetCode', resetCode);

  res.json({ status: `Server is running ! Time:${getStartTime.get()}` });
};

export const resetVerifyToken: ExpressMiddleWare = async (req, res, next) => {
  const emailAddress = req.params.emailAddress;
  console.log('emailAdress', emailAddress);

  try {
    const findEmail = await User.findOne({ emailAddress: emailAddress }).exec();

    if (!findEmail) {
      throw new Error(errName.USER_NOT_FOUND);
    }
    const emailToken = createVerifyToken({ accountID: findEmail._id });

    const confirm = messageTemplate(
      findEmail.username,
      findEmail._id,
      emailToken
    );

    res.send(`<h2>${confirm}</h2>`);
  } catch (err) {
    return next(err);
  }
};