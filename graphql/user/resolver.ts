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
import validator from 'validator';
import { messageTemplate } from '../../utils/verify/verifyMessage-template';
import { createVerifyToken } from '../../utils/jwt/jwt';

const GraphQLResolver = {
  getUserDetails: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      const findUser = await User.findById(req.user._id).lean(true).exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      const { __v, ...relevantDoc } = findUser;

      relevantDoc.createdAt = new Date(
        Number(relevantDoc.createdAt)
      ).toISOString();
      relevantDoc.updatedAt = new Date(
        Number(relevantDoc.updatedAt)
      ).toISOString();

      return relevantDoc;
    } catch (err) {
      throw err;
    }
  },
  fetchSingleUser: async function ({ userID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      const singleUser = await User.findById(userID)
        .populate({
          path: 'follower following',
          select: ['_id', 'username', 'settings'],
          populate: {
            path: 'settings',
            select: 'avatarURI',
          },
        })
        .lean(true)
        .exec();

      if (!singleUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      const { _id, username, publicEmail, followers, following } = singleUser;

      const countFollowers = followers.reduce((acc, val): any => {
        return (acc += 1);
      }, 0);

      const countFollowing = following.reduce((acc, val): any => {
        return (acc += 1);
      }, 0);

      return {
        _id,
        username,
        publicEmail,
        followers: countFollowers,
        following: countFollowing,
        avatarURI: singleUser.settings.avatarURI,
      };
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

    if (!validator.isEmail(emailAddress)) {
      throw new Error(errName.INVALID_EMAIL);
    }
    if (!validator.isLength(password, { min: 5 })) {
      throw new Error(errName.INVALID_PASS);
    }

    try {
      const findUser = await User.findOne({ username: username })
        .lean(true)
        .exec();
      if (findUser) {
        throw new Error(errName.USER_OR_EMAIL_EXISTS);
      }
      const findUserByEmail = await User.findOne({
        emailAddress: emailAddress,
      })
        .lean(true)
        .exec();

      if (findUserByEmail) {
        throw new Error(errName.USER_OR_EMAIL_EXISTS);
      }

      if (password !== confirmPassword) {
        throw new Error(errName.PASSWORD_MISMATCH);
      }
      const secretPassword = await hashedPassword(password);
      const newUser = new User({
        username: username,
        emailAddress: emailAddress.toLowerCase(),
        dateCreated: new Date().getTime().toString(),
        settings: {
          showPublicEmail: false,
        },
        publicEmail: null,
        meta: {
          password: secretPassword,
        },
      });

      await newUser.save();

      const emailToken = await createVerifyToken({ accountID: newUser._id });

      const message = messageTemplate(
        newUser.username,
        newUser._id,
        emailToken
      );

      console.log(message);

      //prettier ignore
      return message;
    } catch (err) {
      throw err;
    }
  },
  updateUser: async function ({ updateUserInput }: any, req: any) {
    const { confirmPassword, password, emailAddress } = updateUserInput;

    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    if (emailAddress && !validator.isEmail(emailAddress)) {
      throw new Error(errName.INVALID_EMAIL);
    }
    if (password && !validator.isLength(password, { min: 5 })) {
      throw new Error(errName.INVALID_PASS);
    }

    if (password && !confirmPassword) {
      throw new Error(errName.PASSWORD_MISMATCH);
    }
    if (password && confirmPassword && password !== confirmPassword) {
      throw new Error(errName.PASSWORD_MISMATCH);
    }

    try {
      const findUser = await User.findById(req.user._id).exec();

      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      if (emailAddress) {
        const checkEmail = await User.findOne({ emailAddress: emailAddress })
          .lean(true)
          .exec();
        if (checkEmail) {
          throw new Error(errName.USER_OR_EMAIL_EXISTS);
        }
        findUser.emailAddress = emailAddress;
        if (findUser.settings.showPublicEmail) {
          findUser.publicEmail = emailAddress;
        }
      }
      if (password) {
        findUser.meta.password = await hashedPassword(password);
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
      if (!user.meta.isVerified) {
        throw new Error(errName.MISSING_VALIDATION);
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
      })
        .lean(true)
        .exec();
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
      req.user.meta.refreshToken = newRefreshToken;
      await req.user.save();
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
      const user = await User.findById(req.user._id).lean(true).exec();
      if (!user) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      req.user.meta.refreshToken = '';
      await req.user.save();
      return 'Logout successful !';
    } catch (err) {
      throw err;
    }
  },
  followUser: async function ({ followUserID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    const targetUser = await User.findById(followUserID).exec();

    if (!targetUser) {
      throw new Error(errName.USER_NOT_FOUND);
    }

    req.user.following.push(targetUser);
    targetUser.followers.push(req.user);

    await req.user.save();
    await targetUser.save();

    return `Success, you are now following ${targetUser.username} !`;
  },
  unFollow: async function ({ userID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    const targetUser = await User.findById(userID).exec();

    if (!targetUser) {
      throw new Error(errName.USER_NOT_FOUND);
    }

    req.user.following = req.user.following.filter((id: any) => {
      return id.toString() !== userID;
    });

    targetUser.followers = targetUser.followers.filter((id: any) => {
      return id.toString() !== req.user.id;
    });

    await req.user.save();
    await targetUser.save();

    return `Let him go, you aren´t further following ${targetUser.username}`;
  },
  getAllFollowerDetails: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    const userWithDetails = await User.findById(req.user._id)
      .populate({
        path: 'followers',
        select: ['_id', 'username', 'publicEmail', 'settings'],
      })
      .lean(true)
      .exec();

    if (!userWithDetails) {
      throw new Error(errName.USER_NOT_FOUND);
    }

    const { followers } = userWithDetails;

    if (!followers) {
      throw new Error(errName.DEFAULT);
    }

    const modifiedArray = userWithDetails.followers.map((entry: any) => {
      const { username, publicEmail, _id } = entry;
      const { avatarURI } = entry.settings;
      return { username, publicEmail, _id, avatarURI };
    });

    return modifiedArray;
  },
  getAllFollowingDetails: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    const userWithDetails = await User.findById(req.user._id)
      .populate({
        path: 'following',
        select: ['_id', 'username', 'publicEmail', 'settings'],
      })
      .lean(true)
      .exec();

    if (!userWithDetails) {
      throw new Error(errName.USER_NOT_FOUND);
    }

    const { following } = userWithDetails;

    if (!following) {
      throw new Error(errName.DEFAULT);
    }

    const modifiedArray = userWithDetails.following.map((entry: any) => {
      const { username, publicEmail, _id } = entry;
      const { avatarURI } = entry.settings;
      return { username, publicEmail, _id, avatarURI };
    });

    return modifiedArray;
  },
  getUserList: async function ({ filterByName, count }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      if (!filterByName) {
        const query = User.find();
        query.select('_id username puplicEmail settings');
        query.getFilter();
        if (count) {
          query.limit(count);
          query.getFilter();
        }
        const showResult = await query.lean(true).exec();

        const modifiedArray = showResult.map((entry) => {
          const { username, publicEmail, _id } = entry;
          const { avatarURI } = entry.settings;
          return { username, publicEmail, _id, avatarURI };
        });

        return modifiedArray;
        // username & puplicMail & avatar
      }

      if (filterByName) {
        const regExp = new RegExp(filterByName);
        const query = User.find({ username: regExp }).select(
          '_id username puplicEmail settings'
        );
        query.getFilter();
        if (count) {
          query.limit(count);
          query.getFilter();
        }
        const showResult = await query.lean(true).exec();
        const modifiedArray = showResult.map((entry) => {
          const { username, publicEmail, _id } = entry;
          const { avatarURI } = entry.settings;
          return { username, publicEmail, _id, avatarURI };
        });

        return modifiedArray;
      }
    } catch (err) {
      throw err;
    }
  },
  setUserSettings: async function ({ inputSettings }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    const { showPublicEmail, signature, description, darkmode } = inputSettings;

    try {
      if (darkmode !== undefined && darkmode !== null) {
        req.user.darkmode = darkmode;
      }

      if (signature) {
        req.user.settings.signature = signature;
      }

      if (description) {
        req.user.settings.description = description;
      }

      if (showPublicEmail !== undefined && showPublicEmail !== null) {
        if (showPublicEmail) {
          req.user.settings.showPublicEmail = showPublicEmail;
          req.user.publicEmail = req.user.emailAddress;
        } else if (showPublicEmail === false) {
          req.user.publicEmail = null;
        }
      }
      return await req.user.save();
    } catch (err) {
      throw err;
    }
  },
  getOwnRecipes: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findUser = await User.findOne({ _id: req.user._id })
        .populate('recipes')
        .lean(true)
        .exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      return findUser.recipes;
    } catch (err) {
      throw err;
    }
  },
  getFavouriteRecipes: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findUser = await User.findOne({ _id: req.user._id })
        .populate('favouriteRecipes')
        .lean(true)
        .exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      return findUser.favouriteRecipes;
    } catch (err) {
      throw err;
    }
  },
  getSavedRecipes: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findUser = await User.findOne({ _id: req.user._id })
        .populate('savedRecipes')
        .lean(true)
        .exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      return findUser.savedRecipes;
    } catch (err) {
      throw err;
    }
  },
  addUserToFavourites: async function ({ favouriteID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findBuddy = await User.findOne({ _id: favouriteID }).exec();
      if (!findBuddy) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      req.user.favouriteUsers.push(findBuddy);
      findBuddy.buddyRequest.push(req.user);
      await findBuddy.save();
      await req.user.save();
      return `User ${findBuddy.username} was added to your favourite user list. The user will will be informed.`;
    } catch (err) {
      throw err;
    }
  },
  confirmBuddy: async function ({ requestID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findRequest = await User.findOne({ _id: requestID }).exec();
      if (!findRequest) {
        throw new Error(errName.USER_NOT_FOUND);
      }
      req.user.favouriteUsers.push(findRequest);
      req.user.buddyRequest = req.user.buddyRequest.filter((id: any) => {
        return id.toString() !== findRequest._id.toString();
      });
      await req.user.save();
      return `User ${findRequest.username} has been added to your favourite user list.`;
    } catch (err) {
      throw err;
    }
  },
  getBuddies: async function ({}, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findUser: any = await User.findOne({ _id: req.user._id })
        .populate({
          path: 'favouriteUsers',
          select: [
            '_id',
            'username',
            'publicEmail',
            'followers',
            'following',
            'recipes',
            'settings',
          ],
          populate: {
            path: 'followers following',
            select: ['_id', 'username', 'publicEmail', 'settings'],
            populate: {
              path: 'settings',
              select: 'avatarURI',
            },
          },
        })
        .lean(true)
        .exec();
      if (!findUser) {
        throw new Error(errName.USER_NOT_FOUND);
      }

      findUser.favouriteUsers.forEach((user: any) => {
        user.avatarURI = user.settings.avatarURI;
        user.followers = user.followers.map((follower: any) => {
          follower.avatarURI = follower.settings.avatarURI;
          return follower;
        });
        user.following = user.following.map((follower: any) => {
          follower.avatarURI = follower.settings.avatarURI;
          return follower;
        });
      });

      return findUser.favouriteUsers;
    } catch (err) {
      throw err;
    }
  },
};

export default GraphQLResolver;
