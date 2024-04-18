import { PoolClient } from "pg";

import pool from "../db.js";
import logger from "../helpers/logger.js";

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

    const result = await client.query(
      `UPDATE waiter SET refresh_token = $1 WHERE id = $2 RETURNING name;`,
      [refreshToken, waiterId]
    );

    await client.query("COMMIT");
    return result.rows[0].name;
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
