import pool from "../db.js";
import { ExtendedAddress, Restaurant } from "../schemas/types/restaurant.js";

import getImageUrl from "../helpers/getImageUrl.js";
import {
  ExtendedAddressSchema,
  RestaurantOverviewBaseSchema,
} from "../schemas/restaurant.js";
import { Menu } from "../schemas/types/menu.js";
import { MenuSchema } from "../schemas/menu.js";

export const getRestaurantById = async (
  id: string
): Promise<Restaurant | null> => {
  try {
    const existingRestaurant = await pool.query(
      `SELECT
       id,
       name,
       description,
       affordability,
       logo_file_path AS "logoImage",
       cover_file_path AS "coverImage"
      FROM restaurant WHERE id = $1 AND listed = true`,
      [id]
    );

    if (existingRestaurant.rows.length === 0) {
      return null;
    }

    const restaurant = existingRestaurant.rows[0];

    if (restaurant.logoImage) {
      restaurant.logoImage = `${process.env.ASSETS_URL}${restaurant.logoImage}`;
    }
    if (restaurant.coverImage) {
      restaurant.coverImage = `${process.env.ASSETS_URL}${restaurant.coverImage}`;
    }

    // Validate restaurant before returning it
    const validatedRestaurant = RestaurantOverviewBaseSchema.parse(restaurant);

    return validatedRestaurant;
  } catch (error) {
    console.error("Error from getRestaurantById function");
    throw error;
  }
};

export const getRestaurantAddressById = async (
  id: string,
  lat: number,
  lon: number
): Promise<ExtendedAddress | null> => {
  try {
    const existingAddress = await pool.query(
      `SELECT 
      address_line as "addressLine",
      city,
      postal_code as "postalCode",
      country_code as "countryCode",
      latitude,
      longitude,
      (6371 * acos(cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) 
      + sin(radians($2)) * sin(radians(latitude)))) AS "distanceKm"
       FROM 
      restaurant_address
       WHERE
      restaurant_id = $1`,
      [id, lat, lon] as any
    );

    if (existingAddress.rows.length === 0) {
      return null;
    }

    let address = existingAddress.rows[0];

    const parsedAddress = ExtendedAddressSchema.parse(address);

    return parsedAddress;
  } catch (error) {
    console.error("Error from getRestaurantAddressById function");
    throw error;
  }
};

export const getRestaurantMenuByRestaurantId = async (
  id: string
): Promise<Menu | null> => {
  try {
    // Query to fetch menu categories along with their menu items for a specific restaurant
    const query = `
    SELECT
      mc.id,
      mc.label,
      mi.id AS item_id,
      mi.name AS item_name,
      mi.description AS item_description,
      mi.ingredients AS item_ingredients,
      mi.price_amount AS item_price_amount,
      mi.price_currency AS item_price_currency,
      mi.image AS item_image
    FROM
      menu_category mc
    JOIN 
      menu_item mi ON mc.id = mi.category_id
    WHERE
      mc.restaurant_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const menuMap = new Map();

    result.rows.forEach((row) => {
      // Set category
      if (!menuMap.has(row.id)) {
        menuMap.set(row.id, {
          categoryId: row.id,
          categoryLabel: row.label,
          categoryItems: [],
        });
      }

      // add items to category
      const category = menuMap.get(row.id);
      category.categoryItems.push({
        id: row.item_id,
        name: row.item_name,
        image: getImageUrl(row.item_image),
        description: row.item_description,
        ingredients: row.item_ingredients,
        priceAmount: row.item_price_amount,
        priceCurrency: row.item_price_currency,
      });
    });

    const menu = Array.from(menuMap.values());

    // Parse our menu before returning it
    const validatedMenu = MenuSchema.parse(menu);

    return validatedMenu;
  } catch (error) {
    console.error("Error from getRestaurantMenuByRestaurantId function");
    throw error;
  }
};
