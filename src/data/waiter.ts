import { PoolClient } from "pg";

import logger from "../helpers/logger.js";
import { fullWaiterData } from "../schemas/waiter.js";
import { FullWaiter } from "../schemas/types/waiter.js";

export const getFullWaiterData = async (
  email: string,
  client: PoolClient
): Promise<FullWaiter | null> => {
  try {
    const result = await client.query(
      `SELECT
        id,
        email,
        name,
        pin,
        restaurant_id as "restaurantId",
        confirmation_pin as "confirmationPin",
        CAST (EXTRACT(EPOCH FROM (NOW() - confirmation_pin_created_at)) / 60 AS FLOAT) AS "minutesDifference"
       FROM
        waiter
       WHERE
        email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const waiterData = fullWaiterData.parse(result.rows[0]);

    return waiterData;
  } catch (e) {
    logger("Failed to retreive waiter confirmation fields from DB", e);
    throw e;
  }
};
