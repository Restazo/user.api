import * as z from "zod";

const restaurantsNearYouSchema = z
  .object({
    user_lat: z.string().optional(),
    user_lon: z.string().optional(),
    range_km: z.string().optional(),
  })
  .strict();

export default restaurantsNearYouSchema;
