let accessTokenString: string | undefined;

export const accessToken = {
  get: () => accessTokenString,
  set: (newToken: string | undefined) => {
    accessTokenString = newToken;
  },
};
