let accessToken: string | null = null;

export const setSession = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearSession = () => {
  accessToken = null;
};