import User, { UserInterface } from '../../models/user.schema';
const MasterKey =
  process.env.CREATE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
import {
  createToken,
  createRefreshToken,
  useRefreshToken,
} from '../../utils/jwt/jwt';

import { hashedPassword, comparePassword } from '../../utils/bCrypt/bCrypt';
import { errName } from '../../utils/error/error-handler';

const GraphQLResolver = {
  getUserDetails: async function ({}, req: any) {
    try {
      if (!req.user) {
        throw new Error(errName.AUTH_FAILED);
      }
      const findUser = await User.findById(req.user._id).exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      return { ...findUser._doc, dateCreated: Number(findUser.dateCreated) };
    } catch (err) {
      throw err;
    }
  },
  createUser: async function ({ createUserInput }: any, req: any) {
    if (req.user) {
      throw new Error(errName.ALREADY_LOGGED_IN);
    }
    const {
      username,
      password,
      emailAddress,
      confirmPassword,
    } = createUserInput;

    try {
      const findUser = await User.findOne({ username: username }).exec();
      if (findUser) {
        throw new Error(errName.USER_OR_EMAIL_EXISTS);
      }
      if (password !== confirmPassword) {
        throw new Error(errName.PASSWORD_MISMATCH);
      }
      const secretPassword = await hashedPassword(password);
      const newUser = new User({
        username: username,
        emailAddress: emailAddress,
        dateCreated: new Date().getMilliseconds().toString(),
        meta: {
          password: secretPassword,
        },
      });

      await newUser.save();
      return `User with name:${username} was successfully created !`;
    } catch (err) {
      throw err;
    }
  },
  updateUser: async function ({ updateUserInput }: any, req: any) {
    const { confirmPassword, ...dataWithoutConfirm } = updateUserInput;

    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    if (updateUserInput.password && !confirmPassword) {
      throw new Error(errName.PASSWORD_MISMATCH);
    }
    if (
      updateUserInput.password &&
      confirmPassword &&
      updateUserInput.password !== confirmPassword
    ) {
      throw new Error(errName.PASSWORD_MISMATCH);
    }

    try {
      const findUser = await User.findById(req.user._id);

      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      const { password, ...remainingProps } = dataWithoutConfirm;

      if (password) {
        findUser.meta.password = await hashedPassword(updateUserInput.password);
      }

      if (remainingProps) {
        let updatedProps = { ...findUser._doc, ...remainingProps };
        findUser._doc = updatedProps;
      }

      return await findUser.save();
    } catch (err) {
      throw err;
    }
  },
  login: async function ({ username, password }: any, req: any) {
    if (req.user) {
      throw new Error(errName.ALREADY_LOGGED_IN);
    }
    try {
      const user = await User.findOne({ username: username }).exec();
      if (!user) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      const comparePass = await comparePassword(password, user.meta.password);
      if (!comparePass) {
        throw new Error(errName.PASSWORD_MISMATCH);
      }
      const authObject = {
        token: createToken({
          username: user.username,
          emailAddress: user.emailAddress,
          isAuth: true,
        }),
        refreshToken: createRefreshToken({
          username: user.username,
          emailAddress: user.emailAddress,
          isAuth: true,
        }),
      };
      user.meta.refreshToken = authObject.refreshToken;
      await user.save();
      return authObject;
    } catch (err) {
      throw err;
    }
  },
  refreshToken: async function ({ refreshToken }: any, req: any) {
    try {
      const newAuthObject = useRefreshToken(refreshToken);
      const user = await User.findOne({
        username: newAuthObject.username,
      }).exec();
      if (!user) {
        throw new Error(errName.TOKEN_EXPIRED);
      }
      if (user.meta.refreshToken !== refreshToken) {
        throw new Error(errName.TOKEN_EXPIRED);
      }
      const newRefreshToken = createRefreshToken({
        username: user.username,
        emailAddress: user.emailAddress,
        isAuth: true,
      });
      user.meta.refreshToken = newRefreshToken;
      await user.save();
      return {
        token: newAuthObject.token,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw err;
    }
  },
  logout: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.LOGOUT_ERROR);
    }
    try {
      const user = await User.findById(req.user._id).exec();
      if (!user) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      user.meta.refreshToken = '';
      await user.save();
      return 'Logout successful !';
    } catch (err) {
      throw err;
    }
  },
};

export default GraphQLResolver;
