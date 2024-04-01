import { Request, Response } from "express";

import pool from "../db.js";
import restaurantsNearYouSchema from "../schemas/restaurantsNearYouReq.js";
import { sendResponse } from "../helpers/responses.js";
import logError from "../helpers/logger.js";
import { Operation } from "../helpers/types/responseMaps.js";
import {
  RestaurantNearUser,
  ProcessedRestaurantElement,
} from "../helpers/types/restaurantData.js";
import { RestaurantData } from "../schemas/restaurantNearYouElement.js";
import getImageUrl from "../helpers/getImageUrl.js";

const defaultRange = Number(process.env.DEFAULT_RANGE);
const defaultLatitude = Number(process.env.DEFAULT_LAT);
const defaultLongitude = Number(process.env.DEFAULT_LON);

export const getRestaurantsNearYou = async (req: Request, res: Response) => {
  const validatedRequest = restaurantsNearYouSchema.safeParse(req.query);

  if (!validatedRequest.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }

  // Convert all the query values into numbers
  const range = validatedRequest.data.range
    ? Number(validatedRequest.data.range)
    : defaultRange;
  const userLatitude =
    validatedRequest.data.user_lat && validatedRequest.data.user_lon
      ? Number(validatedRequest.data.user_lat)
      : defaultLatitude;
  const userLongitude =
    validatedRequest.data.user_lat && validatedRequest.data.user_lon
      ? Number(validatedRequest.data.user_lon)
      : defaultLongitude;

  if (
    Number.isNaN(userLatitude) ||
    Number.isNaN(range) ||
    Number.isNaN(userLongitude)
  ) {
    return sendResponse(res, "Invalid query values", Operation.BadRequest);
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
      r.id, 
      r.name,
      r.cover_file_path as "coverImage",
      r.logo_file_path as "logoImage",
      r.description,
      r.affordability,
      ra.latitude, 
      ra.longitude,
      ra.address_line as "addressLine",
      (6371 * acos(cos(radians($1)) * cos(radians(ra.latitude)) * cos(radians(ra.longitude) - radians($2)) 
      + sin(radians($1)) * sin(radians(ra.latitude)))) AS "distanceKm"
      FROM 
          restaurant r
      INNER JOIN 
          restaurant_address ra ON r.id = ra.restaurant_id
      WHERE
          (6371 * acos(cos(radians($1)) * cos(radians(ra.latitude)) * cos(radians(ra.longitude) - radians($2)) 
          + sin(radians($1)) * sin(radians(ra.latitude)))) <= $3 AND r.listed = true
      ORDER BY
          "distanceKm";
      `,
      [userLatitude, userLongitude, range]
    );

    // Validate each restaurant element from the database query
    const result: ProcessedRestaurantElement[] = rows.reduce(
      (
        acc: ProcessedRestaurantElement[],
        restaurantElement: RestaurantNearUser
      ) => {
        // Validate with the schema
        const validatedRestaurantElement =
          RestaurantData.safeParse(restaurantElement);

        // Don't add just validated element if its validation failed
        // and log an error
        if (!validatedRestaurantElement.success) {
          logError(
            "Restaurant near user returned from database failed validation"
          );
          return acc;
        }

        // Add an element to accumulator with modified images and distance
        acc.push({
          ...restaurantElement,
          coverImage: getImageUrl(restaurantElement.coverImage),
          logoImage: getImageUrl(restaurantElement.logoImage),
          distanceKm: restaurantElement.distanceKm.toFixed(1),
        });

        return acc;
      },
      []
    );

    // Send a successful response with result
    sendResponse(
      res,
      `Restaurants near you within ${range}km range`,
      Operation.Ok,
      result
    );
  } catch (error: any) {
    // Log caught error
    logError("Failed to fetch user closest restaurants", error);

    // Send an error response back to the client
    sendResponse(
      res,
      "We are having some problems with looking for restaurants near you",
      Operation.ServerError
    );
  }
};
