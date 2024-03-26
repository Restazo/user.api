import { Response, response } from "express";
import Status from "./types/status.js";
import { Operation, statusCodeMap } from "./types/operation.js";

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
): Promise<Response> => {
  const statusCode = statusCodeMap[operation];
  const resBody = new ResponseBody(status, message, data);

  return res.status(statusCode).json(resBody);
};
