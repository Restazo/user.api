import { Request, Response } from "express";

import pool from "../db.js";
import { sendResponse } from "../helpers/responses.js";
import logError from "../helpers/logger.js";
import Status from "../helpers/types/status.js";
import { Operation } from "../helpers/types/operation.js";
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

const defaultRange = Number(process.env.DEFAULT_RANGE);
const defaultLatitude = Number(process.env.DEFAULT_LAT);
const defaultLongitude = Number(process.env.DEFAULT_LON);

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
    return sendResponse(
      res,
      Status.Fail,
      "Invalid query values",
      Operation.BadRequest
    );
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
      r.id, 
      r.name,
      r.cover_file_path as "coverImage",
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
          + sin(radians($1)) * sin(radians(ra.latitude)))) <= $3 AND r.listed = true
      ORDER BY
        distance_km;
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
  } catch (error: any) {
    logError("Failed to fetch user closest restaurants", error);
    sendResponse(
      res,
      Status.Error,
      "An error occurred while fetching data",
      Operation.ServerError
    );
  }
};

export const getRestaurantOverview = async (req: Request, res: Response) => {
  try {
    const validatedRequest = RestaurantOverviewReqSchema.safeParse(req.params);

    if (!validatedRequest.success) {
      return sendResponse(
        res,
        Status.Fail,
        "Invalid request",
        Operation.BadRequest
      );
    }

    const { restaurantId } = validatedRequest.data;

    const restaurantData = await getRestaurantById(restaurantId);

    if (!restaurantData) {
      return sendResponse(
        res,
        Status.Fail,
        "No data found",
        Operation.NotFound
      );
    }

    const restaurantAddressData = await getRestaurantAddressById(restaurantId);

    const menuData = await getRestaurantMenuByRestaurantId(restaurantId);

    if (!menuData || !restaurantAddressData) {
      return sendResponse(
        res,
        Status.Fail,
        "No data found",
        Operation.NotFound
      );
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
      Status.Success,
      `Restaurant overview`,
      Operation.Ok,
      validatedResData
    );
  } catch (error) {
    logError("Failed to fetch restaurant overview data", error);
    return sendResponse(
      res,
      Status.Error,
      "An error occurred while fetching data",
      Operation.ServerError
    );
  }
};
