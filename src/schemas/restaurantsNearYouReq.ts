import * as z from "zod";

const restaurantsNearYouSchema = z.object({
  user_lat: z.string(),
  user_lon: z.string(),
  range: z.string().optional(),
});

export default restaurantsNearYouSchema;
