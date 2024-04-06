import * as z from "zod";

const restaurantOverviewQueryParamsSchema = z
  .object({
    user_lat: z.string().optional(),
    user_lon: z.string().optional(),
  })
  .strict();

export default restaurantOverviewQueryParamsSchema;
