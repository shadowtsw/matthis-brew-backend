import jwt from 'jsonwebtoken';
import User from '../../models/user.schema';

const secretKey =
  '7453hjfoi8hjnf9837u45uhkjbgfe8i734ghbihukghbfekjbtdi8f778t32jnk,xl,dc';
const refreshKey =
  'kldsfgh käaebrtöoihjearlkfgasädpövkbisodfj0097u0ßaw3t563523213541er gbdweag';
const TOKEN_EXPIRES: number = Number(process.env.TOKEN_EXPRES_MIN) || 15;
const verifyKey = 'koödsgjilkdsfh6+3663363,d 0445444dddddddddd';

export const createVerifyToken = (data: { accountID: string }) => {
  return jwt.sign(data, verifyKey, { expiresIn: 60 * 60 });
};

export const verifyEmailToken = (emailToken: string) => {
  let dataObject = null as { accountID: string } | null;

  jwt.verify(emailToken, verifyKey, (err, data: any) => {
    if (err) {
      dataObject = null;
    }
    if (data) {
      dataObject = data;
    }
  });

  return dataObject;
};

const createToken = (data: {
  username: string;
  emailAddress: string;
  isAuth: boolean;
}) => {
  return jwt.sign(data, secretKey, { expiresIn: TOKEN_EXPIRES * 60 });
};

const createRefreshToken = (data: {
  username: string;
  emailAddress: string;
  isAuth: boolean;
}) => {
  return jwt.sign(data, refreshKey);
};

const useRefreshToken = (
  refreshToken: string
): { username: string; token: string } => {
  const authObject = {} as { username: string; token: string };
  jwt.verify(refreshToken, refreshKey, (err, data: any) => {
    if (err) {
      console.log(err);
      throw new Error('Token is not valid');
    }
    if (data) {
      authObject.username = data.username;
      console.log(data);
      authObject.token = createToken({
        username: data.username,
        emailAddress: data.emailAddress,
        isAuth: data.isAuth,
      });
    }
  });
  return authObject;
};

//!CHECKED
const verifyToken = (
  token: string
): { username: string; emailAddress: string; isAuth: boolean } | null => {
  let dataObject = null as {
    username: string;
    emailAddress: string;
    isAuth: boolean;
  } | null;

  jwt.verify(token, secretKey, (err, data: any) => {
    if (err) {
      dataObject = null;
    }
    if (data) {
      dataObject = data;
    }
  });

  return dataObject;
};
export { createToken, createRefreshToken, verifyToken, useRefreshToken };
