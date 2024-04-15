import { Request, Response } from "express";

import pool from "../db.js";
import { sendResponse } from "../helpers/responses.js";
import logError from "../helpers/logger.js";
import { Operation } from "../helpers/types/responseMaps.js";
import RestaurantsNearUser from "../schemas/restaurantsNearUser.js";
import getImageUrl from "../helpers/getImageUrl.js";
import {
  getRestaurantAddressById,
  getRestaurantById,
  getRestaurantMenuByRestaurantId,
} from "../data/restaurant.js";
import restaurantsNearYouSchema from "../schemas/restaurantsNearYouReq.js";
import {
  RestaurantOverviewReqSchema,
  RestaurantOverviewResSchema,
} from "../schemas/schemas.js";
import restaurantOverviewQueryParamsSchema from "../schemas/restaurantOverviewQueryParams.js";
import convertIntoNumbers from "../helpers/convertIntoNumers.js";
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

  let valuesToConvert: Map<string, any> = new Map();

  valuesToConvert.set(
    "range_km",
    validatedRequest.data.range_km
      ? validatedRequest.data.range_km
      : defaultRange
  );

  valuesToConvert.set(
    "user_lat",
    validatedRequest.data.user_lat
      ? validatedRequest.data.user_lat
      : defaultLatitude
  );

  valuesToConvert.set(
    "user_lon",
    validatedRequest.data.user_lon
      ? validatedRequest.data.user_lon
      : defaultLongitude
  );

  const convertedValues: Map<string, number> | null =
    convertIntoNumbers(valuesToConvert);

  if (!convertedValues) {
    return sendResponse(res, "Invalid query values", Operation.BadRequest);
  }

  const userLatitude = convertedValues.get("user_lat");
  const userLongitude = convertedValues.get("user_lon");
  const rangeKm = convertedValues.get("range_km");
  if (!userLatitude || !userLongitude || !rangeKm) {
    return sendResponse(res, "Something went wrong", Operation.ServerError);
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
    return sendResponse(
      res,
      `Restaurants near you within 100km range`,
      // `Restaurants near you within ${rangeKm}km range`,
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

    let valuesToConvert: Map<string, any> = new Map();

    valuesToConvert.set(
      "user_lat",
      validatedQueryParams.data.user_lat
        ? validatedQueryParams.data.user_lat
        : defaultLatitude
    );

    valuesToConvert.set(
      "user_lon",
      validatedQueryParams.data.user_lon
        ? validatedQueryParams.data.user_lon
        : defaultLongitude
    );

    const convertedValues: Map<string, number> | null =
      convertIntoNumbers(valuesToConvert);

    if (!convertedValues) {
      return sendResponse(res, "Invalid query values", Operation.BadRequest);
    }

    const userLatitude = convertedValues.get("user_lat")?.toString();
    const userLongitude = convertedValues.get("user_lon")?.toString();
    if (!userLatitude || !userLongitude) {
      return sendResponse(res, "Something went wrong", Operation.ServerError);
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
