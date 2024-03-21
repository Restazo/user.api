import { Request, Response } from "express";

import pool from "../db.js";
import restaurantsNearYouSchema from "../schemas/restaurantsNearYouReq.js";
import { sendResponse, Status, Operation } from "../helpers/responses.js";

const defaultRange = Number(process.env.DEFAULT_RANGE || 100);

export const getRestaurantsNearYou = async (req: Request, res: Response) => {
  const validatedRequest = restaurantsNearYouSchema.safeParse(req.query);

  if (!validatedRequest.success) {
    return sendResponse(
      res,
      Status.Fail,
      "Invalid request",
      Operation.BadRequest
    );
  }

  // Convert all the query values into numbers
  const range = validatedRequest.data.range
    ? Number(validatedRequest.data.range)
    : defaultRange;
  const userLatitude = Number(validatedRequest.data.user_lat);
  const userLongitude = Number(validatedRequest.data.user_lon);

  try {
    const { rows } = await pool.query(
      `SELECT 
      r.id, 
      r.name,
      r.cover_file_name as "coverImage",
      r.description,
      r.affordability,
      ra.latitude, 
      ra.longitude,
      ra.address_line as "addressLine",
      (6371 * acos(cos(radians($1)) * cos(radians(ra.latitude)) * cos(radians(ra.longitude) - radians($2)) 
      + sin(radians($1)) * sin(radians(ra.latitude)))) AS distance_km
      FROM 
          restaurant r
      INNER JOIN 
          restaurant_address ra ON r.id = ra.restaurant_id
      WHERE 
          (6371 * acos(cos(radians($1)) * cos(radians(ra.latitude)) * cos(radians(ra.longitude) - radians($2)) 
          + sin(radians($1)) * sin(radians(ra.latitude)))) <= $3
      `,
      [userLatitude, userLongitude, range]
    );

    sendResponse(
      res,
      Status.Success,
      `Restaurants near you within the range of ${range}km`,
      Operation.Ok,
      rows
    );
  } catch (error) {
    console.error(error);
    sendResponse(
      res,
      Status.Error,
      "An error occurred while fetching data",
      Operation.ServerError
    );
  }
};
