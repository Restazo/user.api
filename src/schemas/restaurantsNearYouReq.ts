import * as z from "zod";

const restaurantsNearYouSchema = z.object({
  user_lat: z.string().optional(),
  user_lon: z.string().optional(),
  range: z.string().optional(),
});

export default restaurantsNearYouSchema;
