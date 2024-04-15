import logger from "../helpers/logger.js";
import pool from "../db.js";

const confirmationPinValidityPeriod = Number(
  process.env.DEFAULT_PIN_VALIDITY_PERIOD
);

export const getWaiterByEmail = async (email: string) => {
  try {
    const result = await pool.query(
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

export const getWaiterConfirmationFieldsByEmail = async (email: string) => {
  try {
    const result = await pool.query(
      `SELECT
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
      result.rows[0].minutesDifference === null ||
      result.rows[0].minutesDifference >= confirmationPinValidityPeriod
    ) {
      return null;
    }

    return result.rows[0];
  } catch (e) {
    logger("Failed to retreive waiter confirmation fields from DB", e);
    throw e;
  }
};

export const setWaiterConfirmationPin = async (pin: string, email: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE waiter
        SET confirmation_pin = $1,
        confirmation_pin_created_at = DEFAULT
       WHERE
        email = $2;
      `,
      [pin, email]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    logger("Failed to set confirmation pin for the waiter", e);

    throw e;
  } finally {
    client.release();
  }
};

export const resetWaiterConfirmationFields = async (email: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE waiter
        SET confirmation_pin = null,
        confirmation_pin_created_at = null
       WHERE
        email = $1;
      `,
      [email]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    logger("Failed to set confirmation pin for the waiter", e);

    throw e;
  } finally {
    client.release();
  }
};
