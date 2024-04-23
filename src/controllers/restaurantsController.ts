import { Request, Response } from "express";

import pool from "../db.js";
import { sendResponse } from "../helpers/responses.js";
import logError from "../helpers/logger.js";
import { Operation } from "../schemas/responseMaps.js";
import getImageUrl from "../helpers/getImageUrl.js";
import {
  getRestaurantAddressById,
  getRestaurantById,
  getRestaurantMenuByRestaurantId,
} from "../data/restaurant.js";
import {
  RestaurantOverviewReqSchema,
  RestaurantOverviewResSchema,
  RestaurantsNearUser,
  restaurantOverviewQueryParamsSchema,
  restaurantsNearYouReq,
} from "../schemas/restaurant.js";
import { getMenuItemById } from "../data/menuItem.js";
import { MenuItemReq } from "../schemas/menu.js";

const defaultRange = Number(process.env.DEFAULT_RANGE);
const defaultLatitude = Number(process.env.DEFAULT_LAT);
const defaultLongitude = Number(process.env.DEFAULT_LON);

export const getRestaurantsNearYou = async (req: Request, res: Response) => {
  const validatedRequest = restaurantsNearYouReq.safeParse(req.query);

  if (!validatedRequest.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }

  const { user_lat, user_lon, range_km } = validatedRequest.data;

  // Start with default latitude and longitude values
  let userLatitude: number = defaultLatitude;
  let userLongitude: number = defaultLongitude;

  // if both latitude AND longitude. Set values accordingly
  if (user_lat && user_lon) {
    userLatitude = user_lat;
    userLongitude = user_lon;
  }

  const rangeKm: number = range_km ? range_km : defaultRange;

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

    const result = dbResultValid.data.map((element) => {
      return {
        ...element,
        coverImage: getImageUrl(element.coverImage),
        logoImage: getImageUrl(element.logoImage),
      };
    });

    // Send a successful response with result
    return sendResponse(
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

export const getRestaurantOverview = async (req: Request, res: Response) => {
  try {
    const validatedQueryParams = restaurantOverviewQueryParamsSchema.safeParse(
      req.query
    );
    const validatedParams = RestaurantOverviewReqSchema.safeParse(req.params);

    if (!validatedParams.success || !validatedQueryParams.success) {
      return sendResponse(res, "Invalid request", Operation.BadRequest);
    }

    const { user_lat, user_lon } = validatedQueryParams.data;

    // Start with default latitude and longitude values
    let userLatitude: number = defaultLatitude;
    let userLongitude: number = defaultLongitude;

    // if both latitude AND longitude. Set values accordingly
    if (user_lat && user_lon) {
      userLatitude = user_lat;
      userLongitude = user_lon;
    }

    const { restaurantId } = validatedParams.data;

    const restaurantData = await getRestaurantById(restaurantId);

    if (!restaurantData) {
      return sendResponse(res, "Restaurant not found", Operation.NotFound);
    }

    const restaurantAddressData = await getRestaurantAddressById(
      restaurantId,
      userLatitude,
      userLongitude
    );

    const menuData = await getRestaurantMenuByRestaurantId(restaurantId);

    if (!menuData || !restaurantAddressData) {
      return sendResponse(res, "No restaurant data found", Operation.NotFound);
    }

    const resData = {
      restaurant: {
        ...restaurantData,
        address: restaurantAddressData,
        menu: menuData,
      },
    };

    const validatedResData = RestaurantOverviewResSchema.parse(resData);

    return sendResponse(
      res,
      `Restaurant overview`,
      Operation.Ok,
      validatedResData
    );
  } catch (error) {
    logError("Failed to fetch restaurant overview data", error);
    return sendResponse(
      res,
      "Something went wrong with looking for a restaurant",
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
