import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { TableSessionJwtPayload } from "../schemas/types/table.js";

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

export const signTableSessionToken = (payload: object) => {
  const tableSessionToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.TABLE_SESSION_TOKEN_EXPIRY,
  });

  return { tableSessionToken };
};

export const verifyTableSessionToken = (
  token: string
): { payload: TableSessionJwtPayload | null; expired: boolean } => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return { payload: decoded as TableSessionJwtPayload, expired: false };
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return { payload: null, expired: error.message.includes("jwt expired") };
    } else {
      return { payload: null, expired: false };
    }
  }
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
