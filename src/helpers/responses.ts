import { Response, response } from "express";
import WebSocket from "ws";
import {
  Operation,
  Status,
  statusCodeMap,
  statusMap,
} from "../schemas/responseMaps.js";

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
  message: string,
  operation: Operation,
  data?: object
): Promise<Response> => {
  const statusCode = statusCodeMap[operation];
  const status = statusMap[operation];
  const resBody = new ResponseBody(status, message, data);

  return res.status(statusCode).json(resBody);
};

export const sendWSResponse = async (
  ws: WebSocket,
  message: string,
  operation: Operation,
  data?: object
): Promise<void> => {
  const status = statusMap[operation];
  const resBody = JSON.stringify(new ResponseBody(status, message, data));

  return ws.send(resBody);
};
