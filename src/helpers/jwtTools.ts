import jwt from "jsonwebtoken";

export enum TokenType {
  access,
  refresh,
}

export const signTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, tokenType: TokenType) => {
  let secret = "";

  switch (tokenType) {
    case TokenType.access:
      secret = process.env.ACCESS_TOKEN_SECRET;
      break;
    case TokenType.refresh:
      secret = process.env.REFRESH_TOKEN_SECRET;
      break;
  }

  try {
    jwt.verify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
};
