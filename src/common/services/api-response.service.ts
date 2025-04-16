import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class ApiResponseHandler {
  sendJsonResponse(
    res: Response,
    { data, statusCode }: { data?: any; statusCode: StatusCodes }
  ) {
    return res.status(statusCode).json({ data });
  }

  sendStatusResponse(
    res: Response,
    { statusCode }: { statusCode: StatusCodes }
  ) {
    return res.sendStatus(statusCode);
  }
}
