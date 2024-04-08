import { Request, Response } from "express";

import pool from "../db.js";
import restaurantsNearYouSchema from "../schemas/restaurantsNearYouReq.js";
import { sendResponse } from "../helpers/responses.js";
import logError from "../helpers/logger.js";
import { Operation } from "../helpers/types/responseMaps.js";
import RestaurantsNearUser from "../schemas/restaurantsNearUser.js";
import getImageUrl from "../helpers/getImageUrl.js";
import MenuItemReq from "../schemas/menuItemReq.js";
import { getMenuItemById } from "../data/menuItem.js";

const defaultRange = Number(process.env.DEFAULT_RANGE);
const defaultLatitude = Number(process.env.DEFAULT_LAT);
const defaultLongitude = Number(process.env.DEFAULT_LON);

export const getRestaurantsNearYou = async (req: Request, res: Response) => {
  const validatedRequest = restaurantsNearYouSchema.safeParse(req.query);

  if (!validatedRequest.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }

  // Convert all the query values into numbers
  const rangeKm = validatedRequest.data.range_km
    ? Number(validatedRequest.data.range_km)
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
    Number.isNaN(rangeKm) ||
    Number.isNaN(userLongitude) ||
    rangeKm <= 0
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
      [userLatitude, userLongitude, rangeKm]
    );

    const dbResultValid = RestaurantsNearUser.safeParse(rows);

    if (!dbResultValid.success) {
      return sendResponse(res, "Something went wrong", Operation.ServerError);
    }

    const result = rows.map((element) => {
      return {
        ...element,
        coverImage: getImageUrl(element.coverImage),
        logoImage: getImageUrl(element.logoImage),
        distanceKm: element.distanceKm.toFixed(1),
      };
    });

    // Send a successful response with result
    sendResponse(
      res,
      `Restaurants near you within ${rangeKm}km range`,
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

export const getMenuItem = async (req: Request, res: Response) => {
  const validatedRequestParams = MenuItemReq.safeParse(req.params);

  if (!validatedRequestParams.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }
  try {
    const itemData = await getMenuItemById(validatedRequestParams.data.itemId);

    if (!itemData) {
      return sendResponse(res, "No menu item data found", Operation.NotFound);
    }

    sendResponse(
      res,
      `Menu item data with id: ${validatedRequestParams.data.itemId}`,
      Operation.Ok,
      itemData
    );
  } catch (error) {
    logError("Failed to get menu item data", error);
    return sendResponse(
      res,
      "Failed to get menu item data",
      Operation.ServerError
    );
  }
};
