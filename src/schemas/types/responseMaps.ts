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

export enum Status {
  Success = "success",
  Fail = "fail",
  Error = "error",
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

export const statusMap: { [key in Operation]: Status } = {
  ok: Status.Success,
  created: Status.Success,
  noContent: Status.Success,
  badRequest: Status.Fail,
  unauthorized: Status.Fail,
  forbidden: Status.Fail,
  notFound: Status.Fail,
  notAllowed: Status.Fail,
  conflict: Status.Fail,
  serverError: Status.Error,
  serviceUnavailable: Status.Error,
};
