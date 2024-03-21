import { Response } from "express";

export enum Status {
  Success = "success",
  Fail = "fail",
  Error = "error",
}

export enum Operation {
  Ok = "ok",
  Created = "created",
  NoContent = "noContent",
  BadRequest = "badRequest",
  Unauthorized = "unauthorized",
  Forbidden = "forbidden",
  NotFound = "notFound",
  NotAllowed = "notAllowed",
  Conflict = "conflict",
  ServerError = "serverError",
  ServiceUnavailable = "serviceUnavailable",
}

const statusCodeMap: { [key in Operation]: number } = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  notAllowed: 405,
  conflict: 409,
  serverError: 500,
  serviceUnavailable: 503,
};

class ResponseBody {
  status: Status;
  message: string;
  data?: object;

  constructor(status: Status, message: string, data?: object) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export const sendResponse = async (
  res: Response,
  status: Status,
  message: string,
  operation: Operation,
  data?: object
) => {
  const statusCode = statusCodeMap[operation];
  const resBody = new ResponseBody(status, message, data);

  return res.status(statusCode).json(resBody);
};
