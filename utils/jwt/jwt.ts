import jwt from 'jsonwebtoken';
import User from '../../models/user.schema';

const secretKey =
  '7453hjfoi8hjnf9837u45uhkjbgfe8i734ghbihukghbfekjbtdi8f778t32jnk,xl,dc';
const refreshKey =
  'kldsfgh käaebrtöoihjearlkfgasädpövkbisodfj0097u0ßaw3t563523213541er gbdweag';
const TOKEN_EXPIRES: number = Number(process.env.TOKEN_EXPRES_MIN) || 15;

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
    if (err) throw new Error('Token is not valid');
    if (data) {
      authObject.username = data.username;
      authObject.token = createToken(data);
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
