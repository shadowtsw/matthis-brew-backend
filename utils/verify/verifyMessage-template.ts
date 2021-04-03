const linkToAuthEndpoint = process.env.AUTH_ENDPOINT || 'http://localhost:3000';
const greeter = process.env.GREETER || 'Chuck-Norris';

export const messageTemplate = (
  username: string,
  accountID: string,
  emailToken: string
) => {
  //prettier-ignore
  return `Success !!  Hello ${username}, follow this link to verifiy your email address: ${linkToAuthEndpoint + '/verify/verifyAccount'}/${accountID}/${emailToken}`;
};

// export const messageTemplate = (
//   username: string,
//   accountID: string,
//   emailToken: string
// ) => {
//   return `
//     Subject: Success !!
//     Please verify your email for ${greeter}

//     Hello ${username},
//     Follow this link to verifiy your email address.
//     ${linkToAuthEndpoint + '/verify/verifyAccount'}/${accountID}/${emailToken}

//     If you didn't ask to verify this adress, you can ignore this email.
//     Thanks,
//     Your ${greeter} team
// `;
// };
