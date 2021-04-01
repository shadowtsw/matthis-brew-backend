import bCrypt from 'bCrypt';

const salting = process.env.SALTING_ROUNDS || 10;
const saltBefore = 'topsecret';
const saltAfter = '@$!';

export const hashedPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bCrypt.hash(
    saltBefore + password + saltAfter,
    10
  );
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  dbPassword: string
): Promise<boolean> => {
  const validate = await bCrypt.compare(
    saltBefore + password + saltAfter,
    dbPassword
  );
  return validate;
};
