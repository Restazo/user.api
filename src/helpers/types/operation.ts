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

export const statusCodeMap: { [key in Operation]: number } = {
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
