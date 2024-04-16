import pool from "../db.js";
import logger from "../helpers/logger.js";
import { PoolClient } from "pg";

export const getWaiterByEmail = async (email: string, client: PoolClient) => {
  try {
    const result = await client.query(
      `SELECT email, pin FROM waiter WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (e) {
    logger("Failed to retreive waiter from DB", e);
    throw e;
  }
};

export const getFullWaiterData = async (email: string, client: PoolClient) => {
  try {
    const result = await client.query(
      `SELECT
        id,
        email,
        restaurant_id as "restaurantId",
        confirmation_pin as "confirmationPin",
        EXTRACT(EPOCH FROM (NOW() - confirmation_pin_created_at)) / 60 AS "minutesDifference"
       FROM
        waiter
       WHERE
        email = $1`,
      [email]
    );

    if (
      result.rowCount === 0 ||
      result.rows[0].confirmationPin === null ||
      result.rows[0].minutesDifference === null
    ) {
      return null;
    }

    return result.rows[0];
  } catch (e) {
    logger("Failed to retreive waiter confirmation fields from DB", e);
    throw e;
  }
};

export const setWaiterConfirmationPin = async (
  pin: string,
  email: string,
  client: PoolClient
) => {
  try {
    await client.query(
      `UPDATE waiter
        SET confirmation_pin = $1,
        confirmation_pin_created_at = DEFAULT
       WHERE
        email = $2;
      `,
      [pin, email]
    );
  } catch (e) {
    logger("Failed to set confirmation pin for the waiter", e);

    throw e;
  }
};

export const logInTheWaiter = async (
  email: string,
  refreshToken: string,
  client: PoolClient
) => {
  try {
    await client.query(
      `UPDATE waiter
        SET confirmation_pin = null,
        confirmation_pin_created_at = null,
        refresh_token = $1
       WHERE
        email = $2;`,
      [refreshToken, email]
    );
  } catch (e) {
    logger("Failed to set confirmation pin for the waiter", e);

    throw e;
  }
};

export const resetWaiterConfirmationDetails = async (
  email: string,
  client: PoolClient
) => {
  try {
    await client.query(
      `UPDATE waiter
        SET confirmation_pin = null,
        confirmation_pin_created_at = null
       WHERE
        email = $1;`,
      [email]
    );
  } catch (e) {
    logger("Failed to reset confirmation details of the waiter", e);

    throw e;
  }
};

export const renewWaiterRefreshToken = async (
  refreshToken: string,
  waiterId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`UPDATE waiter SET refresh_token = $1 WHERE id = $2;`, [
      refreshToken,
      waiterId,
    ]);

    await client.query("COMMIT");
  } catch (e) {
    logger("Failed to renew waiter refresh token", e);

    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const deleteWaiterRefreshToken = async (waiterId: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE waiter SET refresh_token = null WHERE id = $1;`,
      [waiterId]
    );

    await client.query("COMMIT");

    return true;
  } catch (e) {
    logger("Failed to delete waiter refresh token", e);

    await client.query("ROLLBACK");

    throw e;
  } finally {
    client.release();
  }
};
