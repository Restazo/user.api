import * as z from "zod";

export const EnvSchema = z.object({
  ENV: z.string().min(1),
  ASSETS_URL: z.string().min(1),
  API_PORT: z.string().min(1),
  USER_APP_URL: z.string().min(7),
  DB_USER: z.string().min(1),
  DB_PWD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().min(1),
  DB_DATABASE: z.string().min(1),
  DEFAULT_RANGE: z.string().min(1),
  DEFAULT_LAT: z.string().min(1),
  DEFAULT_LON: z.string().min(1),
  RESTAURANTS_ENDPOINTS_ROOT: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  DEFAULT_PIN_VALIDITY_PERIOD: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),
});
