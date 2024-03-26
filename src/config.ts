import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.ENV ||
  !process.env.API_PORT ||
  !process.env.DB_USER ||
  !process.env.DB_PWD ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DEFAULT_RANGE
) {
  console.log("Missing environmental variables. Check your .env file.");
  console.log("Terminating application...");
  process.exit(1);
}
