import { MenuItem } from "../schemas/types/restaurant.js";
import pool from "../db.js";
import getImageUrl from "../helpers/getImageUrl.js";
import { MenuItemSchema } from "../schemas/menu.js";

export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        category_id as "categoryId",
        image,
        description,
        ingredients,
        price_amount as "priceAmount",
        price_currency as "priceCurrency" 
      FROM 
        menu_item 
      WHERE 
        id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const validatedData = MenuItemSchema.parse(result.rows[0]);

    const itemData: MenuItem = {
      ...validatedData,
      image: getImageUrl(result.rows[0].image),
    };

    return itemData;
  } catch (error) {
    throw error;
  }
};
